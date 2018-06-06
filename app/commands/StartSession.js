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
                    console.log(`Creating new session for discord ID: ${foundUser.discord.id}`);
                    Session.create({
                        startedAt: new Date,
                        duration: parseInt(defaultSessionDuration),
                        user: foundUser,
                        channel: {
                            id: message.channel.id,
                        },
                    });
                    cb.addReply(`Starting your session. Enjoy!`);
                } else {
                    console.log(`Adding time to session for discord ID: ${foundUser.discord.id}`);
                    if (session.channel.id !== message.channel.id) {
                        session.channel.id = message.channel.id;
                        cb.addReply(`I will post your match results in this channel`);
                    }
                    session.duration = parseInt(session.duration)+parseInt(defaultSessionDuration);
                    let endTime = new Date(session.startedAt.valueOf() + (60000*session.duration));
                    cb.addReply(`Added ${defaultSessionDuration} minutes to your session. Your session will end ${endTime}`);
                    session.save();
                }
                return cb;
            })
        });

    }
}

module.exports = new StartSession();