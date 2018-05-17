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
        var ic = this;
        this.execute(client);
        this.checkinterval = setInterval(function () { ic.execute(ic.client); }, (this.intervalMinutes * 60000));
    }
    execute(client) {
        Session.find().exec().then(sessions => {
            console.log(`Found ${sessions.length} sessions to check`);
            sessions.forEach(session => {
                let endTimestamp = session.startedAt.valueOf() + (60000*session.duration);
                let now = new Date;
                if (now.valueOf() > endTimestamp) {
                    // session.endSession(); // Future function to give an overview of played matches
                    session.remove();
                } else {
                    new Player().findPlayer(session.playerId).then(player => {
                        player.getPubgId(client, session.channelId).then(playerPubgId => {
                            player.getLastMatchId().then(matchId => {
                                console.log(`Last matchId ${matchId}, for ${player.username}`);
                                if (!session.lastMatch || session.lastMatch !== matchId) {
                                    console.log(`New Match found for: ${session.playerId}`);
                                    session.matches.push({
                                        matchId: matchId
                                    });
                                    session.lastMatch = matchId;
                                    session.save();
                                    let match = new Match(matchId);
                                    match.getMatchData().then(matchData => {
                                        if (matchData > session.startedAt) {
                                            match.getRichEmbedFromPlayer(playerPubgId, player).then(embed => {
                                                console.log(`Sending richembed:`, embed);
                                                client.channels.get(session.channelId).send({embed: embed});
                                            });
                                        } else {
                                            console.log(`Not showing match data. Match was played before starting the session.`);
                                        }
                                    });

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