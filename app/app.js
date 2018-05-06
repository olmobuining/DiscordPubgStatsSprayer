'use strict';
// Discord
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const IntervalChecker = require('./services/IntervalChecker.js');

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
    let ic = new IntervalChecker(client, process.env.DEFAULT_INTERVAL_CHECK_TIME_MIN);
    ic.start();
});

function getCommand(command) {
    if (client.commands.has(command)) {
        return client.commands.get(command);
    } else if (client.aliases.has(command)) {
        return client.commands.get(client.aliases.get(command));
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);

// Just for heroku
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Discord PUBG Stats Sprayer!'));
app.listen(process.env.PORT || 8080);
