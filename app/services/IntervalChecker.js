const Session = require('../schema/Session.js');
const Player = require('../schema/Player.js');
const Match = require('./Match.js');

class IntervalChecker {
    constructor(client, intervalMinutes) {
        this.client = client;
        this.intervalMinutes = intervalMinutes;
        this.checkinterval = null;
    }

    start(client) {
        this.client = client;
        let ic = this;
        this.execute(client);
        this.checkinterval = setInterval(function () { ic.execute(ic.client); }, (this.intervalMinutes * 60000));
    }

    processMatch(client, session, playerPubgId, player, matchId) {
        let match = new Match(matchId);
        match.getMatchData().then(matchData => {
            let buildMatch = match;
            if ((new Date(matchData.raw.data.attributes.createdAt)).getTime() > session.startedAt.getTime()) {
                buildMatch.getRichEmbedFromPlayer(playerPubgId, player).then(embed => {
                    console.log(`Sending richembed:`, embed);
                    client.channels.get(session.channelId).send({embed: embed});
                });
            } else {
                console.log(`Not showing match data. Match was played before starting the session.`);
            }
        });
    }

    execute(client) {
        Session.find().exec().then(sessions => {
            console.log(`Found ${sessions.length} sessions to check`);
            sessions.forEach(session => {
                let endTimestamp = session.startedAt.valueOf() + (60000*session.duration);
                let now = new Date;
                if (now.valueOf() > endTimestamp) {
                    // session.endSession(); // Future function to give an overview of played matches
                    console.log(`This session has expired.`, session);
                    session.remove();
                } else {
                    new Player().findPlayer(session.playerId).then(player => {
                        player.getPubgId(client, session.channelId).then(playerPubgId => {
                            player.getLastMatchId().then(matchId => {
                                console.log(`Last matchId ${matchId}, for ${player.username}`);
                                if (!session.lastMatch || session.lastMatch !== matchId) {
                                    console.log(`New Match found for: ${session.playerId}, username: ${player.username}`);
                                    session.matches.push({
                                        matchId: matchId
                                    });
                                    session.lastMatch = matchId;
                                    session.save();
                                    this.processMatch(client, session, playerPubgId, player, matchId);
                                    /* Tmp disable until we find a way to track matches
                                    player.getMatches().then(matches => {
                                        for (let matchNumber = 4; matchNumber >= 0; matchNumber--) {
                                            if (typeof matches[matchNumber] !== "undefined" && typeof matches[matchNumber].id !== "undefined") {
                                                console.log(`Checking match ${matches[matchNumber].id}, username: ${player.username}`);
                                                this.processMatch(client, session, playerPubgId, player, matches[matchNumber].id);
                                            }
                                        }
                                    });
                                    */
                                }
                            }).catch(err => {
                                console.log(err);
                            });
                        });
                    });
                }
            });
        });
    }
}
module.exports = IntervalChecker;