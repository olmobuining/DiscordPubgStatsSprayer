'use strict';
const User = require('../User/User.js');
const CallbackAction = require('../CallbackAction');
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);

// Adding and getting the PUBG username
class MyPubgUsername {
    constructor() {
        this.aliases = [
            `MyPUBGUsername`,
            `MyPUBGusername`,
            `MyUsername`,
            `un`,
        ];
        this.name = `MyPubgUsername`;
    }
    execute(client, message, args, options) {
        let cb = new CallbackAction('replies');
        return User.findOrCreate(message.author.id, message.author.username, message.author.displayAvatarURL)
        .then(foundUser => {
            console.log(`Found user ${foundUser.discord.username}`);
            if (args.length === 0) {
                return foundUser.getPubgUsername().then(
                    username => {
                        cb.addReply(`According to me, your PUBG username is: ${username}`);
                        return cb;
                    }
                );
            } else if (args.length === 1) {
                const newUsername = args[0];
                return pubg.searchPlayers({playerNames: newUsername})
                    .then(pubgPlayer => {
                        foundUser.displayAvatarURL = message.author.displayAvatarURL;
                        foundUser.pubg.username = newUsername;
                        foundUser.pubg.id = pubgPlayer.data[0].id;
                        return foundUser.save().then(updatedUser => {
                            console.log(`Saved username ${newUsername} to ${updatedUser.discord.id} (PUBG ID: ${pubgPlayer.data[0].id})`);
                            cb.addReply(`Saved your new PUBG username: ${updatedUser.pubg.username}`);
                            return cb;
                        });
                    }, err => {
                        console.log(err);
                        return new Promise((resolve, reject) => {
                            return reject(`Failed to find/save your new username. Please try again. (case sensitive)`);
                        })
                    });

            }
        })
        ;

    }
}

module.exports = new MyPubgUsername();