'use strict';
const Player = require('../schema/Player.js');
const Session = require('../schema/Session.js');

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
            message.channel.send('```' + JSON.stringify(result) + '```');
        });
        Session.find().exec().then(result => {
            message.channel.send('```' + JSON.stringify(result) + '```');
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