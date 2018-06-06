'use strict';
const Session = require('../Session/Session.js');
const CallbackAction = require('../CallbackAction');
const User = require('../User/User.js');

// Stop play time!
class StopSession {
    constructor() {
        this.aliases = [
            `stopsession`,
            `stopSession`,
            `sts`,
        ];
        this.name = `StopSession`;
    }

    execute(client, message, args, options) {
        let cb = new CallbackAction('replies');
        return User.findOneOrCreate(message.author.id, message.author.username, message.author.displayAvatarURL)
        .then(foundUser => {
            return Session.findOne({user: foundUser}).exec().then(session => {
                if (!session) {
                    cb.addReply(`You have no active session`);
                } else {
                    // @todo send an overview of all the matches played in this session.
                    let today = new Date();
                    let playTime = Math.round((today.valueOf() - session.startedAt.valueOf())/60000);
                    session.remove();
                    cb.addReply(`Stopping your session. You have played for ${playTime} minutes!`);
                }
                return cb;
            })
        });

    }
}

module.exports = new StopSession();