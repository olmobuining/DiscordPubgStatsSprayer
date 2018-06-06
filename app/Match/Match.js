let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);
const DamageCauserName = require('../assets/pubg/damageCauserName');
const Discord = require('discord.js');

let MatchSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    data: Object,
    telemetry: {
        players: [
            {
                weapons: Object,
                id: String,
            },
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

MatchSchema.methods.fillData = function () {
    console.log(`Loading match data ${this.id} from PUBG.`);
    return pubg.loadMatchById(this.id).then(matchData => {
        this.data = matchData;
        return this.save(matchObject => {
            return matchObject;
        });
    });
};

MatchSchema.methods.getMatchData = function() {
    // @todo Add a check if the match data even exists. just to be sure.
    return new Promise(resolve => { return resolve(this.data); });
};

MatchSchema.methods.getWeapons = function(playerId) {
    // In case weapon data was already called once before and saved in the database.
    if (this
        && typeof this.telemetry !== 'undefined'
        && typeof this.telemetry.players !== 'undefined'
        && this.telemetry.players.length > 0
    ) {
        console.log(`Some players where cached in the match ${this.matchId}`);
        for (let playerKey in this.telemetry.players) {
            if (this.telemetry.players[playerKey].id === playerId) {
                console.log(`Returning cached player weapons for: ${playerId}`);
                return new Promise(resolve => {
                    return resolve(this.telemetry.players[playerKey].weapons);
                });
            }
        }
    }

    return this.getTelemetry().then(telemetry => {
        const weapons = this.parseTelemetryForWeapons(telemetry, playerId);
        if (typeof this.telemetry.players !== 'undefined' && this.telemetry.length > 0) {
            for (let playerKey in this.telemetry.players) {
                if (this.telemetry.players[playerKey].id === playerId) {
                    console.log(`Found player ${playerId} for telemetry and overwriting`);
                    this.telemetry.players[playerKey].weapons = weapons;
                    this.save();
                    return weapons;
                }
            }
        }
        this.telemetry.players = [];
        this.telemetry.players.push({
            weapons: weapons,
            id: playerId,
        });
        this.save().then(r => {
            console.log(`Saved new player ${playerId} for telemetry ${this.id}`);
        });
        return weapons;
    });
};

MatchSchema.methods.parseTelemetryForWeapons = function(telemetry, playerId) {
    console.log(`Looping through ${telemetry.length} items`);
    let weapons = {};
    telemetry.forEach(item => {
        if ((typeof item.attacker !== "undefined" && item.attacker.accountId === playerId
            )
            && (item._T === 'LogPlayerTakeDamage')
        ) {
            if (item.damageTypeCategory === "Damage_Gun" || item.damageTypeCategory === "Damage_Explosion_Grenade") {
                if (typeof weapons[item.damageCauserName] === "undefined") {
                    weapons[item.damageCauserName] = {};
                    weapons[item.damageCauserName].damage = item.damage;
                    weapons[item.damageCauserName].shots = 1;
                } else {
                    weapons[item.damageCauserName].damage += item.damage;
                    weapons[item.damageCauserName].shots += 1;
                }
            } else if (item.damageTypeCategory === "Damage_Melee"){
                if (typeof weapons[item.damageTypeCategory] === "undefined") {
                    weapons[item.damageTypeCategory] = {};
                    weapons[item.damageTypeCategory].damage = item.damage;
                    weapons[item.damageTypeCategory].shots = 1;
                } else {
                    weapons[item.damageTypeCategory].damage += item.damage;
                    weapons[item.damageTypeCategory].shots += 1;
                }
            } else {
                // No weapon: check https://github.com/pubg/api-assets/blob/master/dictionaries/telemetry/damageTypeCategory.json
                console.log(item);
            }
        }
    });
    return weapons;
};

MatchSchema.methods.getTelemetry = function() {
    let matchObject = this;
    return matchObject.fillTelemetryData().then(telemetryData => {
        return telemetryData;
    });
};

MatchSchema.methods.fillTelemetryData = function() {
    let matchObject = this;
    return new Promise(resolve => {
        if (matchObject.telemetryData) {
            console.log(`locally cached telemetry data`);
            return resolve(matchObject.telemetryData);
        } else {
            return resolve(matchObject.getMatchData().then(matchData => {
                return pubg.findTelemetryURLs(matchData).then(url => {
                    return pubg.loadTelemetry(url).then(telemetry => {
                        matchObject.telemetryData = telemetry;
                        console.log(`Loaded telemetry data from PUBG`);
                        return telemetry;
                    });
                });
            }));
        }
    });
};

MatchSchema.methods.findPlayerData = function (pubgId) {
    return new Promise((resolve, reject) => {
        console.log(`Looking for player ${pubgId} in this matchData.`);
        for (let item of this.data.raw.included) {
            if (item.type === "participant" && item.attributes.stats.playerId === pubgId) {
                return resolve(item);
            }
        }
        console.error(`Player ${pubgId} not found in match data.`);
        return reject(`Could not find player ${pubgId} in this match.`);
    });
};

MatchSchema.methods.playedAfter = function (time) {
    if ((new Date(this.data.raw.data.attributes.createdAt)).getTime() > time) {
        return true;
    }
    return false;
};

MatchSchema.methods.getEmbed = function (user) {
    return this.findPlayerData(user.pubg.id).then(item => {
        let damage = Math.round(item.attributes.stats.damageDealt);
        let survivedMinutes = Math.round(item.attributes.stats.timeSurvived/60);
        let chickenDinner = (item.attributes.stats.winPlace === 1);
        let embed = new Discord.RichEmbed()
            .setTitle(`pubg.op.gg profile page.`)
            .addField(`Place`, item.attributes.stats.winPlace, true)
            .addField(`Kills`, item.attributes.stats.kills, true)
            .addField('Damage', damage, true)
            .addField(`DBNOs`, item.attributes.stats.DBNOs, true)
            .addField(`Assists`, item.attributes.stats.assists, true)
            .addField(`Furthest Kill`, item.attributes.stats.longestKill + `m`, true)
            .setAuthor(user.pubg.username, user.discord.displayAvatarURL)
            .setURL(`https://pubg.op.gg/user/${user.pubg.username}?server=eu`)
            .setFooter(`Surviving for ${survivedMinutes} minutes (${item.attributes.stats.timeSurvived} seconds).`)
            .setTimestamp(this.data.raw.data.attributes.createdAt);
        if (item.attributes.stats.winPlace > 1 && item.attributes.stats.winPlace < 11) {
            embed.setColor('GREEN')
        }
        if (chickenDinner) {
            embed.setColor('GOLD');
        }
        return this.getWeapons(user.pubg.id).then(weapons => {
            for (let weaponType in weapons) {
                embed.addField(`Damage (hits): ${DamageCauserName[weaponType]}`, Math.round(weapons[weaponType].damage) + ` (${weapons[weaponType].shots})`);
            }
            return embed;
        });
    });
};

MatchSchema.statics.findOneAndLoad = async function (matchId) {
    return this.findOne({'id': matchId}).exec().then(match => {
        return new Promise((resolve, reject) => {
            if (match && match.data != "") {
                console.log(`Loading match from database: ${matchId}`);
                return resolve(match);
            } else {
                console.log(`New match. Saving match to database: ${matchId}`);
                return Match.create({
                    id: matchId
                }).then(match => {
                    return match.fillData().then(matchObject => {
                        return resolve(match);
                    });
                });
            }
        });
    });
};

let Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
