"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSManager = void 0;
class SMSManager {
    constructor(notifyOptions) {
        this.notifyOptions = notifyOptions;
    }
    getTo() {
        var _a;
        return (_a = this.notifyOptions) === null || _a === void 0 ? void 0 : _a.to.map(user => user.phone);
    }
    execute() {
        console.log(`Logged this to SMS`);
    }
}
exports.SMSManager = SMSManager;
