'use strict';
const Player = require('../schema/Player.js');
const Session = require('../schema/Session.js');
const MatchData = require('../schema/MatchData.js');

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
        // The only person who can mess with the database.
        if (message.author.id !== "212448886441115648") {
            console.log("user tried an admin command without permission!", message.author.id, message.author.username);
            return;
        }

        if (args.indexOf('sessions') !== -1) {
            this.removeSessions(message);
        }

        if (args.indexOf('players') !== -1) {
            this.removePlayers(message);
            this.removeSessions(message);
        }

        if (args.indexOf('matches') !== -1) {
            this.removeMatches(message);
        }

        if (args.indexOf('pubgids') !== -1) {
            Player.find().exec().then(users => {
                for (let user of users) {
                    console.log(user);
                    if (user.checkId()) {
                        user.pubg.id = "";
                    }
                    user.save();
                }
                message.reply("Removed the associated PUBG ID from each player.");
            });
        }

        if (args.indexOf('playerspubg') !== -1) {
            Player.find().exec().then(user => {
                if (user.checkId()) {
                    user.pubg.id = "";
                }
                if (user.checkUsername()) {
                    user.pubg.username = "";
                }
                user.save();
                message.reply("Removed the associated PUBG ID and Username from each player.");
            })
        }
    }
    removeSessions(message) {
        Session.remove().exec();
        message.reply("Removed all sessions from the database.");
    }
    removeMatches(message) {
        MatchData.remove().exec();
        message.reply("Removed all MatchData from the database.");
    }
    removePlayers(message) {
        Player.remove().exec();
        message.reply("Removed all players from the database.");
    }
}

module.exports = new RemoveData();