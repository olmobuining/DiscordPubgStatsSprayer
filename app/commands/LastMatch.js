'use strict';
const Player = require('../schema/Player.js');
const Match = require('../services/Match.js');

class LastMatch {
    constructor() {
        this.aliases = [
            `lm`,
            `lastmatch`,
        ];
        this.name = `LastMatch`;
    }
    async execute(client, message, args, options) {
        let botMessage = await message.reply(`I'm getting the results of your last played match. This could take a few seconds.`);
        new Player().findPlayer(message.author.id, message.author.username)
            .then(dbPlayer => {
                dbPlayer.getPubgId(this.client, message.channel.id).then(playerPubgId => {
                    dbPlayer.getLastMatchId().then(lastMatchId => {
                        let match = new Match(lastMatchId);
                        match.getRichEmbedFromPlayer(playerPubgId, dbPlayer).then(embed => {
                            console.log(`Sending richembed:`, embed);
                            botMessage.delete();
                            botMessage.channel.send({embed:embed});
                        });
                    }).catch(err => {
                        console.log(err);
                        botMessage.edit(`Failed to receive data: ${err}`);
                    });
                });
            })
            .catch(err => {
                console.log(err);
                botMessage.edit("Failed to receive data.");
            });
    }
}

module.exports = new LastMatch();