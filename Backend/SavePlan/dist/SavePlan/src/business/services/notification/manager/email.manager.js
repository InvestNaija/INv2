"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailManager = void 0;
class EmailManager {
    constructor(notifyOptions) {
        this.notifyOptions = notifyOptions;
        // attachments: any[] = [];
        this.subject = '';
    }
    getTo() {
        var _a;
        return (_a = this.notifyOptions) === null || _a === void 0 ? void 0 : _a.to.map(user => user.email);
    }
    // public addAttachment(attachments: any[]) : any[] {
    //    console.log(`Attachments added to emails`);
    //    this.attachments = attachments;
    //    console.log(this.attachments);
    //    return attachments;
    // }
    execute() {
        console.log(`Logged this to Email`, this.getTo());
    }
}
exports.EmailManager = EmailManager;
