'use strict';
const Player = require('../schema/Player.js');
const Session = require('../schema/Session.js');

// Just for test purposes
// It removes all players in the database to have a clean sheet
class RemoveData {
    constructor() {
        this.aliases = [
            `removedata`,
            `rm`,
        ];
        this.name = `RemoveData`;
    }
    execute(client, message, args, options) {
        this.removeSessions();
        // this.removePlayers();
    }
    removeSessions() {
        Session.remove().exec();
        message.reply("Removed all sessions from the database.");
    }
    removePlayers() {
        // Player.remove().exec();
        // message.reply("Removed all players from the database.");
    }
}

module.exports = new RemoveData();