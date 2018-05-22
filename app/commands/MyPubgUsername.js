'use strict';
const User = require('../User/User.js');
const CallbackAction = require('../CallbackAction');

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
                foundUser.displayAvatarURL = message.author.displayAvatarURL;
                foundUser.pubg.username = args[0];
                foundUser.pubg.id = null;
                return foundUser.save().then(updatedUser => {
                    console.log(`Saved username ${args[0]} to ${updatedUser.discord.id}`);
                    cb.addReply(`Saved your new PUBG username: ${updatedUser.pubg.username}`);
                    return cb;
                });
            }
        })
        ;

    }
}

module.exports = new MyPubgUsername();