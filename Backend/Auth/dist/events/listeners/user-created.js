"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedListener = void 0;
const common_1 = require("@inv2/common");
class UserCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.UserCreated;
        this.queueName = 'auth-service';
    }
    onMessage(data, channel, msg) {
        console.log(data);
        channel.ack(msg);
    }
}
exports.UserCreatedListener = UserCreatedListener;
