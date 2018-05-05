'use strict';
const Player = require('../schema/Player.js');
const Session = require('../schema/Session.js');
const MyPubgUsername = require('./MyPubgUsername.js');
const defaultSessionDuration = process.env.DEFAULT_SESSION_DURATION;

// Adding and getting the PUBG username
class StartSession {

    constructor() {
        this.aliases = [
            `startsession`,
            `startSession`,
            `ss`,
        ];
        this.name = `StartSession`;
        this.errorMessages = {};
    }

    execute(client, message, args, options) {
        new Player().findPlayer(message.author.id, message.author.username).then(player => {
            if (!player.checkUsername()) {
                message.reply(MyPubgUsername.errorMessages.noUsername);
            } else {
                message.reply(`Started your session on ${new Date}`);
                Session.findOne({playerId: player.id}).exec()
                    .then(session => {
                        if (!session) {
                            Session.create({
                                startedAt: new Date,
                                duration: defaultSessionDuration,
                                lastMatch: null,
                                playerId: player.id,
                                channelId: message.channel.id
                            });
                            console.log('Created new session object for user.');
                        } else {
                            session.startedAt = new Date;
                            session.channelId = message.channel.id;
                            session.duration = defaultSessionDuration;
                            session.save(function (err) {
                                if (err){
                                    console.log('Failed to update the start time', err);
                                }
                                console.log('Saved the new starting time on the session', session);
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });

            }
        });
    }
}

module.exports = new StartSession();