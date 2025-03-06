import { NotificationType } from "../INotifiable";
import { BaseNotificationFactory } from "./base-notification.factory";
import { EmailNotificationFactory } from "./email-notification.factory";
import { Notification } from "./notification";
import { SMSNotificationFactory } from "./sms-notification.factory";

export class NotificationFactory {
   public createFactory(notification: Notification): BaseNotificationFactory[] {

      const noty: BaseNotificationFactory[] = [];
      for(const type of notification.type){
         if(type ===NotificationType.SMS) {
            noty.push(new SMSNotificationFactory(notification));
         } else if(type===NotificationType.EMAIL) {
            noty.push(new EmailNotificationFactory(notification));
         } else {
            throw new Error("Specified notification type does not exist");
         }
      }
      return noty!;
   }
}