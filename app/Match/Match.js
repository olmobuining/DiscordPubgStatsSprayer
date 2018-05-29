let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);

let MatchSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    data: Object,
    telemetry: {
        players: [
            {
                weapons: Object,
                id: String,
            },
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

MatchSchema.methods.fillData = function () {
    console.log(`Loading match data ${this.id} from PUBG.`);
    return pubg.loadMatchById(this.id).then(matchData => {
        this.data = matchData;
        return this.save(matchObject => {
            return matchObject;
        });
    });
};

MatchSchema.methods.findPlayerData = function (pubgId) {
    return new Promise((resolve, reject) => {
        console.log(`Looking for player ${pubgId} in this matchData.`);
        for (let item of this.data.raw.included) {
            if (item.type === "participant" && item.attributes.stats.playerId === pubgId) {
                return resolve(item);
            }
        }
        console.error(`Player ${pubgId} not found in match data.`);
        return reject(`Could not find player ${pubgId} in this match.`);
    });
};


MatchSchema.statics.findOneAndLoad = function (matchId) {
    return this.findOne({'id': matchId}).exec().then(match => {
        return new Promise((resolve, reject) => {
            if (match && match.data != "") {
                console.log(`Loading match from database: ${matchId}`);
                return resolve(match);
            } else {
                console.log(`New match. Saving match to database: ${matchId}`);
                return Match.create({
                    id: matchId
                }).then(match => {
                    return match.fillData().then(matchObject => {
                        return resolve(match);
                    });
                });
            }
        });
    });
};

let Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
