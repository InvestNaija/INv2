import { SMSManager } from "../manager/sms.manager";
import { INotifiable } from "../INotifiable";
import { BaseNotificationFactory } from "./base-notification.factory";

export class SMSNotificationFactory extends BaseNotificationFactory {
   public create(): INotifiable {
      const smsMgr = new SMSManager();
      //Compute any other SMS related things here
      return smsMgr;
   }

}