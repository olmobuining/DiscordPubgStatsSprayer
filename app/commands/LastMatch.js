'use strict';
const Player = require('../schema/Player.js');
const MyPubgUsername = require('./MyPubgUsername.js');
const Discord = require('discord.js');
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
        let botMessage = await message.reply(`I'm getting the results of your last played match. This could take a few seconds.`);
        new Player().findPlayerInDatabase(message.author.id, message.author.username)
        .then(dbPlayer => {
            dbPlayer.getPubgId(client, message.channel.id)
                .then(playersPubgId => {
                    createLastMatchOverview(playersPubgId, botMessage, message);
                })
                .catch(err => {
                    console.log(err);
                    botMessage.edit("Failed to get data.");
                });
        });
    }
}

async function createLastMatchOverview(playerId, botMessage, playerMessage) {
    pubg.loadPlayerById(playerId).then((playerData, err) => {
        if (!playerData || err) {
            console.log(playerData, err);
            botMessage.edit("Failed to receive data.");
            return;
        }
        let matchId = playerData.data.relationships.matches.data[0].id;
        pubg.loadMatchById(matchId).then(matchData => {
            for (let item of matchData.raw.included) {
                if (item.type === "participant" && item.attributes.stats.playerId === playerId) {
                    let damage = Math.round(item.attributes.stats.damageDealt, 2);
                    // console.log(item.attributes.stats);
                    let rich = new Discord.RichEmbed()
                        .setTitle(`Here's an overview of your last match.`)
                        .addField(`Place`, item.attributes.stats.winPlace, true)
                        .addField(`Kills`, item.attributes.stats.kills, true)
                        .addField('Damage', damage, true)
                        .addField(`DBNOs`, item.attributes.stats.DBNOs, true)
                        .addField(`Assists`, item.attributes.stats.assists, true)
                        .addField(`Furthest Kill`, item.attributes.stats.longestKill + `m`, true)
                        .setAuthor(playerMessage.author.username, playerMessage.author.displayAvatarURL)
                        .setTimestamp(matchData.raw.data.attributes.createdAt);
                    botMessage.delete();
                    botMessage.channel.send({embed:rich});
                }
            }
        });
    });
}

async function findPlayerIdByName(username) {
    return pubg.searchPlayers({playerNames: username})
    .then(result => {
        return result;
    }, err => {
        console.error(err);
    });
}

module.exports = new LastMatch();