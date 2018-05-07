'use strict';
const Player = require('../schema/Player.js');
const Session = require('../schema/Session.js');

// Adding and getting the PUBG username
class StopSession {
    constructor() {
        this.aliases = [
            `stopsession`,
            `stopSession`,
            `sts`,
        ];
        this.name = `StopSession`;
        this.errorMessages = {};
    }

    execute(client, message, args, options) {
        new Player().findPlayer(message.author.id, message.author.username).then(player => {
            Session.findOne({playerId: player.id}).exec()
                .then(session => {
                    if (!session) {
                        // No active session running for this user.
                        message.reply(`You have no active session.`);
                    } else {
                        // @todo send an overview of all the matches played in this session.
                        let today = new Date();
                        let playTime = Math.round((today.valueOf() - session.startedAt.valueOf())/60000);
                        session.remove();
                        message.reply(`I've stopped your session. In the future I will post an overview of all played games in this session. You have played for ${playTime} minutes!`);
                    }
                })
                .catch(error => {
                    console.log(error);
                });

        });
    }

    endSessionAction() {

    }
}

module.exports = new StopSession();