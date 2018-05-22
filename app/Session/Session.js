let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;

let sessionSchema = new Schema({
    startedAt: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    lastMatch: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    channel: {
        id: {
            type: String,
            required: true,
        },
    },
    // matches: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Match'
    //     }
    // ],
});

let Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
