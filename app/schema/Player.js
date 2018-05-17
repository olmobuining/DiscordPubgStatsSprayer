let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);

let playerSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    displayAvatarURL: {
        type: String,
        required: false,
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
    createdAt: {
        type: Date,
        default: Date.now
    },
});

playerSchema.methods.checkUsername = function () {
    if (typeof this.pubg === 'undefined' || !this.pubg.username) {
        return false;
    }
    return true;
};

playerSchema.methods.checkId = function () {
    if (typeof this.pubg === 'undefined' || !this.pubg.id) {
        return false;
    }
    return true;
};

playerSchema.methods.pubgFindPlayerIdByName = async function (username) {
    return pubg.searchPlayers({playerNames: username})
        .then(result => {
            return result;
        }, err => {
            console.error(err);
        });
};

playerSchema.methods.getPubgId = async function (client, channelId) {
    let MyPubgUsername = require('../commands/MyPubgUsername.js');
    thisPlayer = this;
    return new Promise(function (resolve, reject) {
        console.log(`Trying to get PUBG ID for ${thisPlayer.username}`);
        let newPlayerObject = thisPlayer;
        if (!newPlayerObject.checkUsername()) {
            console.log("Players PUBG username was empty:", newPlayerObject.pubg);
            let errorMessage = `<@${newPlayerObject.id}>, ${MyPubgUsername.errorMessages.noUsername}`;
            client.channels.get(channelId).send(errorMessage);
            reject(errorMessage);
        }
        if (!newPlayerObject.checkId()) {
            console.log(`Player did not have a PUBG ID yet. ${newPlayerObject.username}`);
            newPlayerObject.pubgFindPlayerIdByName(newPlayerObject.pubg.username).then(pubgPlayer => {
                newPlayerObject.pubg.id = pubgPlayer.data[0].id;
                newPlayerObject.save(function (err) {
                    if (err){
                        console.log('ERROR: failed to get PUBG ID.', err);
                    }
                    console.log('Saved PUBG ID to player', newPlayerObject);
                });
                if (!pubgPlayer) {
                    reject(`Failed to receive your PUBG ID, please make sure your username '${newPlayerObject.pubg.username}' is correct. (case sensitive)`);
                }
                resolve(pubgPlayer.data[0].id);
            });
        } else {
            resolve(newPlayerObject.pubg.id);
        }
    });
};

playerSchema.methods.findPlayer = function(discordId, discordUsername) {
    return Player.where({ id: discordId }).findOne().exec().then((result) => {
        if (!result) {
             return Player.create({
                id: discordId,
                username: discordUsername,
            }).then(resultingPlayer => {
                return resultingPlayer;
            });
        }
        return result;
    });
};

playerSchema.methods.getLastMatchId = function() {
    return pubg.loadPlayerById(this.pubg.id).then((playerData, err) => {
        if (!playerData || err) {
            console.log(`Failed to get last match id for the player`, playerData, err);
            return;
        }
        if (playerData.data.relationships.matches.data.length > 1) {
            return playerData.data.relationships.matches.data[0].id;
        }
        console.log(`no matches found for ${playerData.data.id}`);
        throw `no matches found for ${playerData.data.attributes.name}`;
    })
    ;
};

let Player = mongoose.model('Player', playerSchema);

module.exports = Player;