let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;
const Match = require('../Match/Match.js');
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);
const Discord = require('discord.js');

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
        shard: {
            type: String,
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
            return reject(`<@${this.discord.id}>, I'm sorry. I don't know your PUBG username yet.\nPlease tell me your username by typing: \`${process.env.BOT_PREFIX}MyUsername yourPUBGusernameHERE\` `);
        }
        return resolve(this.pubg.username);
    });

};

UserSchema.methods.getShard = function () {
    if (typeof this.pubg === 'undefined' || !this.pubg.shard) {
        return process.env.DEFAULT_SHARD;
    }
    return this.pubg.shard;
};

UserSchema.methods.getMatches = function() {
    return this.getPubgUsername().then(username => {
        console.log(`Getting matches for ${username}::${this.pubg.id}`);
        return pubg.loadPlayerById(this.pubg.id, this.getShard()).then((playerData, err) => {
            if (!playerData || err) {
                console.log(`Failed to get last match id for the player`, playerData, err);
                throw `Failed to get data.`;
            }
            if (playerData.data.relationships.matches.data.length > 0) {
                return playerData.data.relationships.matches.data;
            }
            console.log(`No matches found for ${playerData.data.id}`);
            throw `No matches found for ${playerData.data.attributes.name}`;
        })
        ;
    });
};

UserSchema.methods.getLastMatchEmbed = function() {
    return this.getMatches().then(matches => {
        return Match.findOneAndLoad(matches[0].id).then(match => {
            return match.findPlayerData(this.pubg.id).then(playerItem => {
                let damage = Math.round(playerItem.attributes.stats.damageDealt);
                let survivedMinutes = Math.round(playerItem.attributes.stats.timeSurvived/60);
                let embed = new Discord.RichEmbed()
                    .setTitle(`pubg.op.gg profile page.`)
                    .addField(`Place`, playerItem.attributes.stats.winPlace, true)
                    .addField(`Kills`, playerItem.attributes.stats.kills, true)
                    .addField('Damage', damage, true)
                    .addField(`DBNOs`, playerItem.attributes.stats.DBNOs, true)
                    .addField(`Assists`, playerItem.attributes.stats.assists, true)
                    .addField(`Furthest Kill`, playerItem.attributes.stats.longestKill + `m`, true)
                    .setAuthor(this.discord.username, this.discord.displayAvatarURL)
                    .setURL(`https://pubg.op.gg/user/${this.pubg.username}?server=eu`)
                    .setFooter(`Surviving for ${survivedMinutes} minutes (${playerItem.attributes.stats.timeSurvived} seconds).`)
                    .setTimestamp(match.data.raw.data.attributes.createdAt);

                return embed;
            });
        });
    });
};

UserSchema.statics.findOneOrCreate = function (discordId, discordUsername, displayAvatarURL) {
    return this.findOne({'discord.id': discordId, 'discord.username': discordUsername}).exec().then(foundUser => {
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
            console.log(`Found Discord user ${discordId}::${discordUsername}`);
            return new Promise(resolve => {
                return resolve(foundUser);
            })
        }
    })
};

let User = mongoose.model('User', UserSchema);

module.exports = User;