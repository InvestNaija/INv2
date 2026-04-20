"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNotificationFactory = void 0;
class BaseNotificationFactory {
    constructor(notification) {
        this.notification = notification;
    }
    notify() {
        //We can add things that pertain to all notifiables
        //Then call the create method
        const notifiable = this.create();
        this.notification.to = notifiable.getTo();
        notifiable.execute();
        return this.notification;
    }
}
exports.BaseNotificationFactory = BaseNotificationFactory;
