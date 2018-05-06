const Session = require('../schema/Session.js');
const Player = require('../schema/Player.js');
const Match = require('./Match.js');

class IntervalChecker {
    constructor(client, intervalMinutes) {
        this.client = client;
        this.intervalMinutes = intervalMinutes;
        this.checkinterval = null;
    }
    start() {
        this.execute();
        this.checkinterval = setInterval(this.execute, (this.intervalMinutes * 60000));
    }
    execute() {
        ic = this;
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
                        player.getLastMatchId().then(matchId => {
                            if (!session.lastMatch || session.lastMatch !== matchId) {
                                console.log(`New Match found for: ${session.playerId}`);
                                session.lastMatch = matchId;
                                session.save();
                                let match = new Match(matchId);
                                player.getPubgId(ic.client, session.channelId).then(playerPubgId => {
                                    match.getRichEmbedFromPlayer(playerPubgId, player).then(embed => {
                                        console.log(`sending richembed:`, embed);
                                        ic.client.channels.get(session.channelId).send({embed:embed});
                                    });
                                });
                            }
                        });
                    });
                }
            });
        });
    }

}
module.exports = IntervalChecker;