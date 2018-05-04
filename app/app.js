'use strict';
// Discord
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const Player = require('./schema/Player.js');
const Session = require('./schema/Session.js');
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);

const prefix = process.env.BOT_PREFIX;

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir(`./commands/`, (err, files) => {
    if (err) {
        console.error(err);
    }
    console.info(`Found ${files.length} commands.`);
    files.forEach(f => {
        let theCommand = require(`./commands/${f}`);
        console.info(`Loading Command: ${theCommand.name}.`);
        client.commands.set(theCommand.name, theCommand);
        theCommand.aliases.forEach(alias => {
            client.aliases.set(alias, theCommand.name);
        });
    });
});

client.on('message', message => {
    // Ignore other bots 
    if (message.author.bot) return;

    // Ignore requests without our prefix
    if (!message.content.startsWith(prefix)) {
        return;
    }
    let command = message.content.split(' ')[0].slice(prefix.length);
    let args = message.content.split(' ').slice(1);

    // Get command
    let cmd = getCommand(command);
    
    // Run command
    if (cmd) {
        console.log(`Run command: ${cmd.name}, with arguments: ${args}`);
        cmd.execute(client, message, args, {});
    }
});

client.on('ready', () => {
    function findNewMatches() {
        Session.find().exec().then(sessions => {
            sessions.forEach(session => {
                let endTimestamp = session.startedAt.valueOf() + (60000*session.duration);
                let now = new Date;
                if (now.valueOf() > endTimestamp) {
                    session.remove();
                }
                LastMatchCheck(session, client);
            });
            console.log(sessions);
        });
    }

    function createLastMatchOverview(matchId, playerId, client, channelId) {
        console.log("loading match");
        pubg.loadMatchById(matchId).then(matchData => {
            for (let item of matchData.raw.included) {
                if (item.type === "participant" && item.attributes.stats.playerId === playerId) {
                    let damage = Math.round(item.attributes.stats.damageDealt, 2);
                    let rich = new Discord.RichEmbed()
                        .setTitle(`Here's an overview of your last match.`)
                        .addField(`Place`, item.attributes.stats.winPlace, true)
                        .addField(`Kills`, item.attributes.stats.kills, true)
                        .addField('Damage', damage, true)
                        .addField(`DBNOs`, item.attributes.stats.DBNOs, true)
                        .addField(`Assists`, item.attributes.stats.assists, true)
                        .addField(`Furthest Kill`, item.attributes.stats.longestKill + `m`, true)
                        // .setAuthor(playerMessage.author.username, playerMessage.author.displayAvatarURL)
                        .setTimestamp(matchData.raw.data.attributes.createdAt);

                    console.log(`sending rich:`, rich);
                    client.channels.get(channelId).send({embed:rich});
                }
            }
        });
    }
    function LastMatchCheck(session, client) {
        console.log(`checking session for playerId: ${session.playerId}`);
        new Player().findPlayerInDatabase(session.playerId).then(player => {
            pubg.loadPlayerById(player.pubg.id).then((playerData, err) => {
                if (!playerData || err) {
                    console.log(playerData, err);
                    return;
                }
                let matchId = playerData.data.relationships.matches.data[0].id;
                if (!session.lastMatch || session.lastMatch !== matchId) {
                    console.log(`New Match found for: ${session.playerId}`);
                    session.lastMatch = matchId;
                    session.save();
                    createLastMatchOverview(matchId, player.pubg.id, client, session.channelId);
                }
            }).catch(err => {
                console.log("LastMatchCheck failed : ", err);
            });
        });
    }
    // When the bot starts, directly check for new matches instead of waiting the default time.
    findNewMatches();
    let intervalTime = (process.env.DEFAULT_INTERVAL_CHECK_TIME_MIN * 60000);
    let checkinterval = setInterval(findNewMatches, intervalTime);
});



function getCommand(command) {
    if (client.commands.has(command)) {
        return client.commands.get(command);
    } else if (client.aliases.has(command)) {
        return client.commands.get(client.aliases.get(command));
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);