import { EmailManager } from "../manager/email.manager";
import { INotifiable } from "../INotifiable";
import { BaseNotificationFactory } from "./base-notification.factory";

export class EmailNotificationFactory extends BaseNotificationFactory {
   public create(): INotifiable {
      const emailMgr = new EmailManager();
      // console.log('In email factory',this.notification.attachments);
      
      // Compute any EMail specific things here, like adding attachment and subject
      // this.notification.attachments = emailMgr.addAttachment([]);
      this.notification.subject = emailMgr.subject;
      return emailMgr;
   }

}