class Callback {
    constructor(client, message) {
        this.client = client;
        this.message = message;
    }
    reply(text) {
        this.message.reply(text);
    }
    replies(data) {
        if (typeof data.replies === 'undefined' || data.replies.length === 0) {
            console.log(`Callback for replies, while no replies were given.`);
            this.reply(`Failed to receive a reply message. Pleaes try again later.`);
            return;
        }
        data.replies.forEach(text => {
            this.reply(text);
        })
    }
    call(data) {
        if (typeof data.callbackMethod === 'undefined') {
            console.log(`Callback method is undefined.`);
            return;
        }
        this[data.callbackMethod](data.callbackData);
    }
}

module.exports = Callback;