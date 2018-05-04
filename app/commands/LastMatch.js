'use strict';
const Player = require('../schema/Player.js');
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);
const prefix = process.env.BOT_PREFIX;

class LastMatch {
    constructor() {
        this.aliases = [
            `lm`,
            `lastmatch`,
        ];
        this.name = `LastMatch`;
    }
    async execute(client, message, args, options) {
        let prevMessage = await message.reply(`I'm getting the results of your last played match. This could take a few seconds.`);
        Player.methods.findPlayerInDatabase(message.author.id, message.author.username)
        .then(dbPlayer => {
            if (typeof dbPlayer.pubg === "undefined" || !dbPlayer.pubg.username) {
                console.log("Players PUBG username was empty:", dbPlayer.pubg);
                prevMessage.edit(`<@${dbPlayer.id}> I'm sorry, I don't know your PUBG username yet.\nPlease tell me your username by typing: \`${prefix}MyPubgUsername yourPUBGusernameHERE\``);
                return;
            }
            if (typeof dbPlayer.pubg === "undefined" || !dbPlayer.pubg.id) {
                console.log("Players PUBG ID was empty:", dbPlayer.pubg);
                findPlayerIdByName(dbPlayer.pubg.username)
                    .then(playerData => {
                        console.log("Players PUBG ID:", playerData.data[0].id);
                        dbPlayer.pubg.id = playerData.data[0].id;
                        dbPlayer.save(function (err) {
                            if (err){
                                console.log('FAILED', err);
                            }
                            console.log('Saved Player');
                        });
                        killsLastMatch(dbPlayer.pubg.id, prevMessage, dbPlayer.id);
                    });
            } else {
                killsLastMatch(dbPlayer.pubg.id, prevMessage, dbPlayer.id);
            }
        });
    }
}

async function killsLastMatch(playerId, message, messageForId) {
    pubg.loadPlayerById(playerId).then(playerData => {
        let matchId = playerData.data.relationships.matches.data[0].id;
        pubg.loadMatchById(matchId).then(matchData => {
            for (let item of matchData.raw.included) {
                if (item.type === "participant" && item.attributes.stats.playerId === playerId) {
                    let damage = Math.round(item.attributes.stats.damageDealt, 2);
                    message.edit(`<@${messageForId}>, In your last match you had ${ item.attributes.stats.kills } kills and dealt ${ damage } damage.`);
                }
            }
        });
    }, err => {
        message.edit("Unable to get stats, please check the log");
        console.log(err);
    });
}

async function findPlayerIdByName(username) {
    return pubg.searchPlayers({playerNames:username})
    .then(result => {
        return result;
    }, err => {
        console.error(err);
    });
}

module.exports = new LastMatch();