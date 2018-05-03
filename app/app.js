'use strict';

// Discord
const Discord = require('discord.js');
const client = new Discord.Client();

// PUBG
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.DISCORD_BOT_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);
const prefix = process.env.BOT_PREFIX

async function killsLastMatch(message) {
    let playerId = "account.596da277f2a94906a890aed74a6b1472" // Arazu
    // let playerId = "account.2ce70d019a6841018d685962f8a397b9" // Ryangr0

    let playerData = await pubg.loadPlayerById(
            playerId
    );
    let matchId = playerData.data.relationships.matches.data[0].id;
    let matchData = await pubg.loadMatchById(matchId);
    for (let item of matchData.raw.included) {
        if (item.type === "participant" && item.attributes.stats.playerId === playerId) {
            let damage = Math.round(item.attributes.stats.damageDealt, 2);
            message.reply(`In your last match you had ${ item.attributes.stats.kills } kills and dealt ${ damage } damage.`);
        }
    }
}

client.on('message', message => {
    // Ignore other bots 
    if (message.author.bot) return;

    if (message.content === '!ss-kills' || message.content === 'a') {
        console.log('Getting data...');
        killsLastMatch(message);
    }

    /*
    To do list:
    - Start play session.
    - Stop play session (also automatically after 4-6 hours?) (with end details like total damage and kills this session).
    - Show last match of player (in case the session didnt start yet).
    - Add players to the current play session (or maybe ask that when starting to track, but we need this command to add players if they come later into the session).
    - Remove player from the current play session.
    - Interval check every 5-15 minutes for any completed matches for all the players in the current play session.
    */

});

client.login(process.env.DISCORD_BOT_TOKEN);