let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;

let playerSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    pubg: {
        id: {
            type: String,
            required: false,
        },
        username: {
            type: String,
            required: false,
        },
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});
let Player = mongoose.model('Player', playerSchema);

async function findPlayerInDatabase(discordId, discordUsername) {
    let findId = Player.where({ id: discordId });
    return findId.findOne().exec().then((result) => {
        if (!result) {
            return Player.create({
                id: discordId,
                username: discordUsername,
            }).then(resultingPlayer => {
                return resultingPlayer;
            })
        }
        return result;
    });
}

module.exports = {
    schema: Player,
    methods: {
        findPlayerInDatabase: findPlayerInDatabase
    },
};