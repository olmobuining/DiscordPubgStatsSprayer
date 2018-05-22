'use strict';
const CallbackAction = require('../CallbackAction');

// Just for test purposes
class Test {
    constructor() {
        this.aliases = [
            `test`,
            `t`,
        ];
        this.name = `Test`;
    }
    execute(client, message, args, options) {
        return new Promise(resolve => {
            let cb = new CallbackAction('reply');
            cb.setData({text: `${args.join(' ')}`});
            return resolve(cb);
        })
    }
}

module.exports = new Test();