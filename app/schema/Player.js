var mongoose = require('../mongoose.js');
var Schema = mongoose.Schema;

let playerSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    pubgAccountId: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;