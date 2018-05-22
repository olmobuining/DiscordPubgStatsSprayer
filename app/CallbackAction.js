class CallbackAction {
    constructor(callbackMethod) {
        this.callbackMethod = callbackMethod;
        this.callbackData = {};
    }
    setData(data) {
        this.callbackData = data;
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