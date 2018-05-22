'use strict';
const User = require('../User/User.js');
const CallbackAction = require('../CallbackAction');

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
        return new Promise((resolve, reject) => {
            // The only person who can mess with the database.
            if (message.author.id !== "212448886441115648") {
                console.log("user tried an admin command without permission!", message.author.id, message.author.username);
                return reject("Command failed...");
            }
            let cb = new CallbackAction('replies');
            if (args.indexOf('users') !== -1) {
                return resolve(User.remove().exec().then(result => {
                    cb.addReply(`Deleted all users from the database`);
                    return cb;
                }));
            }
        });
    }
    removeUsers() {
        return ;
    }
}

module.exports = new RemoveData();