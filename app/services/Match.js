const Discord = require('discord.js');
const damageCauserName = require('../assets/pubg/damageCauserName');
const MatchData = require('../schema/MatchData.js');
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);

class Match {
    constructor(matchId) {
        this.matchId = matchId;
        this.matchData = false;
    }
    getWeapons(playerId) {
        return this.getTelemetry().then(telemetry => {
            console.log(`looping through ${telemetry.length} items`);
            let weapons = {};
            telemetry.forEach(item => {
                if ((typeof item.attacker !== "undefined" && item.attacker.accountId === playerId
                    )
                    && (item._T === 'LogPlayerTakeDamage')
                ) {
                    if (item.damageTypeCategory === "Damage_Gun") {
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
            // console.log(weapons);
            return weapons;
        });
    }
    getTelemetry() {
        let matchObject = this;
        return MatchData.where({ id: this.matchId }).findOne().exec().then((matchDataObject) => {
            if (!matchDataObject) {
                return matchObject.fillTelemetryData().then(matchDataObject => {
                    return matchDataObject.telemetry.data;
                });
            } else {
                if (typeof matchDataObject.telemetry === 'undefined' || typeof matchDataObject.telemetry.data === 'undefined') {
                    return matchObject.fillTelemetryData().then(matchDataObject => {
                        return matchDataObject.telemetry.data;
                    });
                } else {
                    console.log(`Telemetry data was already filled in the database for: ${matchObject.matchId}`);
                    return matchDataObject.telemetry.data;
                }
            }

        });
    }
    fillTelemetryData() {
        let matchObject = this;
        console.log(`Attempting to fill telemetry data for: ${matchObject.matchId}`);
        return this.getMatchData().then(matchData => {
            return MatchData.where({ id: this.matchId }).findOne().exec().then((matchDataObject) => {
                return pubg.findTelemetryURLs(matchData).then(url => {
                    return pubg.loadTelemetry(url).then(telemetry => {
                        matchDataObject.telemetry.data = telemetry;
                        matchDataObject.save().then(matchDataObject => {
                            console.log(`Saved telemetry data for: ${matchObject.matchId}`);
                            return matchDataObject;
                        });
                    });
                });
            });
        });
    }
    fillMatchData() {
        let matchObject = this;
        console.log(`Loading match data ${matchObject.matchId} from PUBG.`);
        return pubg.loadMatchById(matchObject.matchId).then(matchData => {
            console.log(`Match data from PUBG`);
            matchObject.matchData = matchData;
            return matchData;
        });
    }
    getMatchData() {
        let matchObject = this;
        return new Promise((resolve, reject) => {
            if(!matchObject.matchData) {
                return resolve(MatchData.where({ id: matchObject.matchId }).findOne().exec().then((result) => {
                    if (!result) {
                        return matchObject.fillMatchData()
                        .then(matchData => {
                            console.log(`Match data was not cached for ${matchObject.matchId}, creating a new database record`);
                            return MatchData.create({
                                id: matchObject.matchId,
                                data: matchData,
                            }).then(MatchDataObject => {
                                matchObject.matchData = matchData;
                                return matchObject.matchData;
                            });
                        });
                    } else {
                        console.log(`Match data was database cached for ${matchObject.matchId}`);
                        matchObject.matchData = result.data;
                        return matchObject.matchData;
                    }
                }));
            } else {
                console.log(`Match data was locally cached for ${matchObject.matchId}`);
                return resolve(matchObject.matchData);
            }
        });
    }
    findPlayerData(playerPubgId) {
        return this.getMatchData().then(matchData => {
            // console.log(matchData);
            console.log(`Found match data and looking for player ${playerPubgId} in this data.`);
            for (let item of matchData.raw.included) {
                if (item.type === "participant" && item.attributes.stats.playerId === playerPubgId) {
                    return item;
                }
            }
            console.log(`Player ${playerPubgId} not found in match data.`);
            return false;
        });
    }
    getRichEmbedFromPlayer(playerPubgId, player) {
        let tmpMatch = this;
        return this.findPlayerData(playerPubgId).then(item => {
            let parentMatch = tmpMatch;
            console.log(`Building RichEmbed for player ${playerPubgId}`);
            let damage = Math.round(item.attributes.stats.damageDealt);
            let survivedMinutes = Math.round(item.attributes.stats.timeSurvived/60);
            return parentMatch.getWeapons(playerPubgId).then(weaponData => {
                let embed = new Discord.RichEmbed()
                    .setTitle(`pubg.op.gg profile page.`)
                    .addField(`Place`, item.attributes.stats.winPlace, true)
                    .addField(`Kills`, item.attributes.stats.kills, true)
                    .addField('Damage', damage, true)
                    .addField(`DBNOs`, item.attributes.stats.DBNOs, true)
                    .addField(`Assists`, item.attributes.stats.assists, true)
                    .addField(`Furthest Kill`, item.attributes.stats.longestKill + `m`, true)
                    .setAuthor(player.username, player.displayAvatarURL)
                    .setURL(`https://pubg.op.gg/user/${player.pubg.username}?server=eu`)
                    .setFooter(`Surviving for ${survivedMinutes} minutes (${item.attributes.stats.timeSurvived} seconds).`)
                    .setTimestamp(this.matchData.raw.data.attributes.createdAt);
                for (let weaponType in weaponData) {
                    embed.addField(`Damage (hits): ${damageCauserName[weaponType]}`, Math.round(weaponData[weaponType].damage) + ` (${weaponData[weaponType].shots})`);
                }
                return embed;
            });
        });
    }
}
module.exports = Match;