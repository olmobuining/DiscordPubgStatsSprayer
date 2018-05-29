class Callback {
    constructor(client, message) {
        this.client = client;
        this.message = message;
    }

    reply(text) {
        this.message.reply(text);
    }

    channel(data) {
        if (typeof data.messages === 'undefined' || data.messages.length === 0) {
            console.log(`Callback for channel, while no messages were given.`);
            return;
        }
        data.messages.forEach(text => {
            this.client.channels.get(data.channelId).send(text);
        });
    }

    replies(data) {
        if (typeof data.replies === 'undefined' || data.replies.length === 0) {
            console.log(`Callback for replies, while no replies were given.`);
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