const Session = require('./Session.js');
const Callback = require('../Callback.js');

const SessionTask = function (client) {
    console.log(`Starting the session task!`);
    Session.find().exec().then(sessions => {
        if (sessions.length === 0) {
            console.log(`No active sessions found`);
        }
        sessions.forEach(session => {
            session.task()
            .then(callbackAction => {
                const cb = new Callback(client, null);
                console.log("Callback: ", callbackAction); // debug
                cb.call(callbackAction);
            })
            .catch(error => {
                console.log(error);
                client.channels.get(session.channel.id).send(error);
            })
            ;
        });
    });

};

module.exports = SessionTask;
