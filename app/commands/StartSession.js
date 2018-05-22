'use strict';
const defaultSessionDuration = process.env.DEFAULT_SESSION_DURATION;
const Session = require('../Session/Session.js');
const CallbackAction = require('../CallbackAction');
const User = require('../User/User.js');

// starting play time!
class StartSession {

    constructor() {
        this.aliases = [
            `startsession`,
            `startSession`,
            `ss`,
            `addTime`,
            `AddTime`,
            `at`,
            `start`,
            `Start`,
        ];
        this.name = `StartSession`;
    }

    execute(client, message, args, options) {
        let cb = new CallbackAction('replies');
        return User.findOneOrCreate(message.author.id, message.author.username, message.author.displayAvatarURL)
        .then(foundUser => {
            return Session.findOne({user: foundUser}).exec().then(session => {
                if (!session) {
                    console.log('NOT FOUND in database, creating...');
                    Session.create({
                        startedAt: new Date,
                        duration: defaultSessionDuration,
                        user: foundUser,
                        channel: {
                            id: message.channel.id,
                        },
                    });
                    return cb;
                }
                console.log('found in database');
                console.log(session);
                return cb;
            })
        });

    }
}

module.exports = new StartSession();