'use strict';
const Player = require('../schema/Player.js');
const Session = require('../schema/Session.js');
const MatchData = require('../schema/MatchData.js');

// Just for test purposes
class GetData {
    constructor() {
        this.aliases = [
            `getdata`,
            `data`,
        ];
        this.name = `GetData`;
    }
    execute(client, message, args, options) {
        Player.find().exec().then(result => {
            message.channel.send('Player\n```' + JSON.stringify(result).slice(0,500) + '```');
        });
        Session.find().exec().then(result => {
            message.channel.send('Session\n```' + JSON.stringify(result).slice(0,500) + '```');
        });
        MatchData.find().exec().then(result => {
            message.channel.send('MatchData\n```' + JSON.stringify(result).slice(0,1000) + '```');
        });
        // new Player().findPlayer("95268432638910464", "Ryan").then(user => {
        //     user.pubg.username = "Ryangr0";
        //     user.save();
        // });
        // return Player.create({
        //     id: "95268432638910464",
        //     username: "Ryan",
        // })
        // Session.create({
        //     startedAt: new Date,
        //     duration: 240,
        //     lastMatch: null,
        //     playerId: "95268432638910464",
        //     channelId: "441617803573985283"
        // });
    }
}

module.exports = new GetData();