let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;
const CallbackAction = require('../CallbackAction');
const User = require('../User/User.js');
const Match = require('../Match/Match.js');

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
    matches: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
});

sessionSchema.methods.getUser = function() {
    return User.findOne(this.user._id).exec();
};

sessionSchema.methods.hasMatch = function (matchToCheck) {
    for (let counter = 0; counter < this.matches.length; counter ++) {
        if (matchToCheck._id.equals(this.matches[counter]._id)) {
            return true;
        }
    }
    return false;
};

sessionSchema.methods.findNewMatches = async function(cb) {
    const currentSession = this;
    return this.getUser().then(user => {
        return user.getMatches().then(async function(matches)  {
            for (let matchNumber = 4; matchNumber >= 0; matchNumber--) {
                if (typeof matches[matchNumber] !== "undefined" && typeof matches[matchNumber].id !== "undefined") {
                    console.log(matches[matchNumber].id);
                    await Match.findOneAndLoad(matches[matchNumber].id).then(async function(match) {
                        if (match.playedAfter(currentSession.startedAt.getTime())
                            && !currentSession.hasMatch(match)) {
                            await match.getEmbed(user).then(embed => {
                                cb.addMessage(embed);
                            });
                            currentSession.matches.push(match._id);
                        }
                    });
                }
            }
            currentSession.save();
            return cb;
        });
    });
};

sessionSchema.methods.task = async function() {
    let cb = new CallbackAction('channel');
    cb.setChannel(this.channel.id);
    let endTimestamp = this.startedAt.valueOf() + (60000*this.duration);
    let now = new Date;
    if (now.valueOf() > endTimestamp) {
        console.log(`This session has expired.`, this);
        return this.getUser().then(user => {
            cb.addMessage(`Session time of ${user.discord.username} has expired and has been stopped.`);
            this.remove();
            return cb;
        });
    } else {
        return await this.findNewMatches(cb);
    }
};

let Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
