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
    }
}

module.exports = new GetData();