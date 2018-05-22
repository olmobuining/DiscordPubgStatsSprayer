let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    discord: {
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

UserSchema.methods.checkUsername = function () {
    if (typeof this.pubg === 'undefined' || !this.pubg.username) {
        return false;
    }
    return true;
};
UserSchema.methods.checkId = function () {
    if (typeof this.pubg === 'undefined' || !this.pubg.id) {
        return false;
    }
    return true;
};
UserSchema.methods.getPubgUsername = function () {
    return new Promise((resolve, reject) => {
        if (!this.checkUsername()) {
            return reject(`I'm sorry, I don't know your PUBG username yet.\nPlease tell me your username by typing: \`${process.env.BOT_PREFIX}MyUsername yourPUBGusernameHERE\``);
        }
        return resolve(this.pubg.username);
    });

};

UserSchema.statics.findOrCreate = function (discordId, discordUsername, displayAvatarURL) {
    return this.findOne({discord:{id: discordId, username: discordUsername}}).exec().then(foundUser => {
        if (!foundUser) {
            console.log(`Creating Discord user ${discordId}::${discordUsername}`);
            return this.create({
                discord: {
                    id: discordId,
                    username: discordUsername,
                    displayAvatarURL: displayAvatarURL,
                }
            }).then(createdUser => {
                return createdUser;
            });
        } else {
            console.log(foundUser);
            console.log(`Found Discord user ${discordId}::${discordUsername}`);
            return new Promise(resolve => {
                return resolve(foundUser);
            })
        }
    })
};

let User = mongoose.model('User', UserSchema);

module.exports = User;
