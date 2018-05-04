'use strict';
const Player = require('../schema/Player.js');

// Just for test purposes
// It removes all players in the database to have a clean sheet
class RemovePlayers {
    constructor() {
        this.aliases = [
            `removeplayers`,
            `rmp`,
        ];
        this.name = `RemovePlayers`;
    }
    execute(client, message, args, options) {
        Player.schema.remove().exec();
        message.reply("Removed all players from the database.");
    }
}

module.exports = new RemovePlayers();