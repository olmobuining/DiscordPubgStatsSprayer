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
        this.telemetryData = false;
    }
    getWeapons(playerId) {
        return MatchData.where({ id: this.matchId }).findOne().exec().then((matchDataObject) => {
            if (matchDataObject
                && typeof matchDataObject.telemetry !== 'undefined'
                && typeof matchDataObject.telemetry.players !== 'undefined'
                && matchDataObject.telemetry.players.length > 0
            ) {
                console.log(`Some players where cached in the match ${this.matchId}`);
                for (let playerKey in matchDataObject.telemetry.players) {
                    if (matchDataObject.telemetry.players[playerKey].id === playerId) {
                        console.log(`Returning cached player weapons for: ${playerId}`);
                        return matchDataObject.telemetry.players[playerKey].weapons;
                    }
                }
            }
            return this.getTelemetry().then(telemetry => {
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
                // console.log(weapons);
                return MatchData.where({ id: this.matchId }).findOne().exec().then((foundMatchDataObj) => {
                    if (typeof foundMatchDataObj.telemetry.players !== 'undefined' && foundMatchDataObj.telemetry.length > 0) {
                        for (let playerKey in foundMatchDataObj.telemetry.players) {
                            if (foundMatchDataObj.telemetry.players[playerKey].id === playerId) {
                                console.log(`Found player ${playerId} for telemetry and overwriting`);
                                foundMatchDataObj.telemetry.players[playerKey].weapons = weapons;
                                foundMatchDataObj.save();
                                return weapons;
                            }
                        }
                    }

                    foundMatchDataObj.telemetry.players = [];
                    foundMatchDataObj.telemetry.players.push({
                        weapons: weapons,
                        id: playerId,
                    });
                    foundMatchDataObj.save().then(r => {
                        console.log(`Saved new player ${playerId} for telemetry ${this.matchId}`);
                    });

                    return weapons;
                });
            });
        });
    }
    getTelemetry() {
        let matchObject = this;
        return matchObject.fillTelemetryData().then(telemetryData => {
            return telemetryData;
        });
    }
    fillTelemetryData() {
        let matchObject = this;
        return new Promise(resolve => {
            if (matchObject.telemetryData) {
                console.log(`locally cached telemetry data`);
                return resolve(matchObject.telemetryData);
            } else {
                return resolve(this.getMatchData().then(matchData => {
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
            console.log(`Looking for player ${playerPubgId} in this matchData.`);
            for (let item of matchData.raw.included) {
                if (item.type === "participant" && item.attributes.stats.playerId === playerPubgId) {
                    return item;
                }
            }
            console.log(`Player ${playerPubgId} not found in match data.`);
            return false;
        });
    }
    randomChickenDinnerImage() {
        const images = [
            'https://i.ebayimg.com/images/g/AeQAAOSw8lpZJz2k/s-l1600.jpg',
            'https://ih1.redbubble.net/image.374573832.5501/flat,800x800,075,f.jpg',
            'https://www.tshirtxy.com/sites/default/files/styles/flexslider_full/public/tshirt-image-new/main/game-pubg-t-shirt-for-men-winner-winner-chicken-dinner-short-sleeve-tee-xxxl-247615.jpg?itok=FsDTIqHa',
            'https://i.pinimg.com/originals/eb/4a/ce/eb4ace9e73cff240a963a742dea0ff6c.jpg',
            'https://www.spreadshirt.com.au/image-server/v1/mp/designs/1012141713,width=178,height=178/pubg-winner-winner-chicken-dinner.png',
        ];
        return images[Math.floor(Math.random() * images.length)];
    }
    getRichEmbedFromPlayer(playerPubgId, player) {
        let tmpMatch = this;
        return this.findPlayerData(playerPubgId).then(item => {
            let parentMatch = tmpMatch;
            console.log(`Building RichEmbed for player ${playerPubgId}`);
            let damage = Math.round(item.attributes.stats.damageDealt);
            let survivedMinutes = Math.round(item.attributes.stats.timeSurvived/60);
            return parentMatch.getWeapons(playerPubgId).then(weaponData => {
                let chickenDinner = (item.attributes.stats.winPlace === 1);
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
                if (item.attributes.stats.winPlace > 1 && item.attributes.stats.winPlace < 11) {
                    embed.setColor('GREEN')
                }
                if (chickenDinner) {
                    embed.setColor('GOLD')
                        .setImage(this.randomChickenDinnerImage());
                }
                for (let weaponType in weaponData) {
                    embed.addField(`Damage (hits): ${damageCauserName[weaponType]}`, Math.round(weaponData[weaponType].damage) + ` (${weaponData[weaponType].shots})`);
                }
                return embed;
            });
        });
    }
}
module.exports = Match;