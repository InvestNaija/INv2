
// interface Notifies<T extends INotifiable> {
//    notify(n: T):void;

import { UserDto } from "../_dtos";
import { EmailService } from "./email.service";
import { INotifiable, INotifyOptions } from "./INotifiable"
import { SMSService } from "./sms.service";

enum NotificationType {
   EMAIL= 'email',
   SMS = 'sms'
}
interface Options {
   /** Specify the type of message to be sent. Formerly used as setEmailType() */
   messageType?: string;
   /** This is particularly required in Email types */
   template?: string;
   /** This is particularly required in Email types */
   attachments?: any[];
}
export class Notification {
   private notifiable: INotifiable[]
   
   constructor(types: NotificationType[], notifyOptions: INotifyOptions) { 
      for(const t of types){
         let noty: INotifiable;
         if(t==='sms') {
            noty = new SMSService(notifyOptions)
         }
         else if(t==='email') noty = new EmailService(notifyOptions);
         this.notifiable.push(noty)
      }
   }
   setOptions(options: Options) {}
   execute() {
      for(const notify of this.notifiable){
         notify.execute()
      }
   }
}

const svc = new Notification(
   [NotificationType.EMAIL, NotificationType.SMS],
   {
      sender: { firstName: 'InvestNaija', email: 'noreply@investnaija.com', phone: '+2347065725667' },
      recipient: [{firstName: 'Abimbola', email: 'infinitizon@gmail.com', phone: '+2347065725667'},{firstName: 'Juwon', email: 'abimbola.d.hassan@gmail.com', phone: '+2347065725667'}],
      message: "This is a test message"
   }
)