let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;

let matchSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    data: {
        type: Object,
    },
    telemetry: {
        data: {
            type: Object,
        },
        players: [
            {
                data: {
                    type: Object,
                },
                id: {
                    type: String,
                },
            },
        ],
    }
});

let MatchData = mongoose.model('MatchData', matchSchema);

module.exports = MatchData;