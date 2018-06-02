class CallbackAction {
    constructor(callbackMethod) {
        this.callbackMethod = callbackMethod;
        this.callbackData = {};
    }
    setData(data) {
        this.callbackData = data;
    }
    setChannel(channelId) {
        this.callbackData.channelId = channelId;
    }
    addMessage(text) {
        if (typeof this.callbackData.messages === 'undefined') {
            this.callbackData.messages = [];
        }
        if (typeof text !== 'undefined' && (text.length > 0 || typeof text === 'object') ) {
            this.callbackData.messages.push(text);
        }
    }
    addReply(text) {
        if (typeof this.callbackData.replies === 'undefined') {
            this.callbackData.replies = [];
        }
        if (text.length > 0) {
            this.callbackData.replies.push(text);
        }
    }
}

module.exports = CallbackAction;