'use strict';
const CallbackAction = require('../CallbackAction');
const User = require('../User/User.js');
const Match = require('../Match/Match.js');

// Show the last match played
class LastMatch {

    constructor() {
        this.aliases = [
            `lm`,
            `lastmatch`,
        ];
        this.name = `LastMatch`;
    }

    execute(client, message, args, options) {
        let cb = new CallbackAction('channel');
        cb.setChannel(message.channel.id);
        return User.findOneOrCreate(message.author.id, message.author.username, message.author.displayAvatarURL)
        .then(foundUser => {
            return foundUser.getMatches().then(matches => {
                if (matches.length > 0) {
                    return Match.findOneAndLoad(matches[0].id).then(match => {
                        return match.getEmbed(foundUser).then(embed => {
                            cb.addMessage(embed);
                            return cb;
                        });
                    });
                } else {
                    cb.addMessage(`No matches found for ${foundUser.pubg.username}.`);
                    return cb;
                }
            });
        });
    }

}

module.exports = new LastMatch();