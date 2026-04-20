"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationFactory = void 0;
const INotifiable_1 = require("../INotifiable");
const email_notification_factory_1 = require("./email-notification.factory");
const sms_notification_factory_1 = require("./sms-notification.factory");
class NotificationFactory {
    createFactory(notification) {
        const noty = [];
        for (const type of notification.type) {
            if (type === INotifiable_1.NotificationType.SMS) {
                noty.push(new sms_notification_factory_1.SMSNotificationFactory(notification));
            }
            else if (type === INotifiable_1.NotificationType.EMAIL) {
                noty.push(new email_notification_factory_1.EmailNotificationFactory(notification));
            }
            else {
                throw new Error("Specified notification type does not exist");
            }
        }
        return noty;
    }
}
exports.NotificationFactory = NotificationFactory;
