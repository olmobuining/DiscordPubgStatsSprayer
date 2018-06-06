'use strict';
const User = require('../User/User.js');
const CallbackAction = require('../CallbackAction');
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);

// Adding and getting the PUBG username
class Shard {
    constructor() {
        this.aliases = [
            `shard`,
            `Server`,
            `server`,
        ];
        this.name = `Shard`;
    }
    execute(client, message, args, options) {
        let cb = new CallbackAction('replies');
        return User.findOneOrCreate(message.author.id, message.author.username, message.author.displayAvatarURL)
        .then(foundUser => {
            if (args.length === 0) {
                cb.addReply(`According to me, you are playing on: ${foundUser.pubg.shard}`);
                return cb;
            } else if (args.length === 1) {
                const newShard = args[0];
                if (newShard === 'eu' || newShard === 'na') {
                    foundUser.pubg.shard = 'pc-' + newShard;
                    return foundUser.save().then(updatedUser => {
                        cb.addReply(`Changed your shard to ${newShard}.`);
                        return cb;
                    });
                } else {
                    cb.addReply(`I am sorry, I do not support \`${newShard}\` as a shard.`);
                    return cb;
                }
            }
        })
        ;

    }
}

module.exports = new Shard();