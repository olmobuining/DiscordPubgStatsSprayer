let mongoose = require('../mongoose.js');
let Schema = mongoose.Schema;
const CallbackAction = require('../CallbackAction');
const User = require('../User/User.js');

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

sessionSchema.methods.getUser = function() {
    return User.findOne(this.user._id).exec();
};

sessionSchema.methods.findNewMatches = function() {
    return new Promise(resolve => {
        return resolve([]);
    });
};

sessionSchema.methods.task = function() {
    let cb = new CallbackAction('channel');
    cb.setChannel(this.channel.id);
    let endTimestamp = this.startedAt.valueOf() + (60000*this.duration);
    let now = new Date;
    if (now.valueOf() > endTimestamp) {
        console.log(`This session has expired.`, this);
        return this.getUser().then(user => {
            cb.addMessage(`Session of ${user.discord.username} has expired and has been stopped.`);
            this.remove();
            return cb;
        });
    }
    return new Promise(resolve => {
        return resolve(cb);
    });
};

let Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
