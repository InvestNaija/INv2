"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSNotificationFactory = void 0;
const sms_manager_1 = require("../manager/sms.manager");
const base_notification_factory_1 = require("./base-notification.factory");
class SMSNotificationFactory extends base_notification_factory_1.BaseNotificationFactory {
    create() {
        const smsMgr = new sms_manager_1.SMSManager();
        //Compute any other SMS related things here
        return smsMgr;
    }
}
exports.SMSNotificationFactory = SMSNotificationFactory;
