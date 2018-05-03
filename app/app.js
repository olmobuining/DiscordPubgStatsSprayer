'use strict';

const Player = require('./schema/Player.js');
// Discord
const Discord = require('discord.js');
const client = new Discord.Client();

// PUBG
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);
const prefix = process.env.BOT_PREFIX

async function killsLastMatch(playerId, message) {
    // let playerId = "account.596da277f2a94906a890aed74a6b1472" // Arazu
    // let playerId = "account.2ce70d019a6841018d685962f8a397b9" // Ryangr0

    pubg.loadPlayerById(playerId).then(playerData => {
        let matchId = playerData.data.relationships.matches.data[0].id;
        pubg.loadMatchById(matchId).then(matchData => {
            for (let item of matchData.raw.included) {
                if (item.type === "participant" && item.attributes.stats.playerId === playerId) {
                    let damage = Math.round(item.attributes.stats.damageDealt, 2);
                    message.reply(`In your last match you had ${ item.attributes.stats.kills } kills and dealt ${ damage } damage.`);
                }
            }
        });
    }, err => {
        message.reply("Unable to get stats, please check the log")
    });
    
}

function findPlayerIdByName(username) {
    return pubg.searchPlayers({playerNames:username})
    .then(result => {
        return result;
    }, err => {
        console.error(err);
    });
}

function findPlayerInDatabase(discordId, discordUsername) {
    let findId = Player.where({ id: discordId });
    let resultPlayer = null;
    return findId.findOne().exec().then((result) => {
        if (!result) {
            var player = Player({
                id: discordId,
                username: discordUsername,
            });
            player.save(function (err) {
                if (err){
                    console.log('FAILED', err);
                }
                console.log('Saved new Player', player);
            });
        }
        return result;
    });
}



client.on('message', message => {
    // Ignore other bots 
    if (message.author.bot) return;

    if (message.content === 'b') {
        findPlayerInDatabase(message.author.id, message.author.username)
        .then(dbPlayer => {
            if (typeof dbPlayer.pubgAccountId === "undefined") {
                findPlayerIdByName(dbPlayer.username)
                    .then(playerData => {
                        console.log("Player ID PUBG:", playerData.data[0].id);
                        dbPlayer.pubgAccountId = playerData.data[0].id;
                        dbPlayer.save(function (err) {
                            if (err){
                                console.log('FAILED', err);
                            }
                            console.log('Saved new Player', player);
                        });
                    });
            }
            killsLastMatch(dbPlayer.pubgAccountId, message);
        });
    }
    if (message.content === 'getplayers') {
        Player.find().exec().then(result => {
            console.log(result);
        });
        message.reply('Check the console.');
    }

    if (message.content === 'removeplayers') {
        Player.remove().exec();
        message.reply("emptied database");
    }

});

client.login(process.env.DISCORD_BOT_TOKEN);