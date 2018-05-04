let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;

let sessionSchema = new Schema({
    startedAt: {
        type: Date,
    },
    duration: {
        type: Number,
    },
    lastMatch: {
        type: String,
    },
    playerId: {
        type: String,
    },
    channelId: {
        type: String,
    },
});

let Session = mongoose.model('Session', sessionSchema);

module.exports = Session;