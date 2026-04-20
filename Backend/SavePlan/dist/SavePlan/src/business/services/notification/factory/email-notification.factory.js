"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotificationFactory = void 0;
const email_manager_1 = require("../manager/email.manager");
const base_notification_factory_1 = require("./base-notification.factory");
class EmailNotificationFactory extends base_notification_factory_1.BaseNotificationFactory {
    create() {
        const emailMgr = new email_manager_1.EmailManager();
        // console.log('In email factory',this.notification.attachments);
        // Compute any EMail specific things here, like adding attachment and subject
        // this.notification.attachments = emailMgr.addAttachment([]);
        this.notification.subject = emailMgr.subject;
        return emailMgr;
    }
}
exports.EmailNotificationFactory = EmailNotificationFactory;
