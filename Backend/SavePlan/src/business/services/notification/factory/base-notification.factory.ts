import { INotifiable } from "../INotifiable";
import { Notification } from "./notification";

export abstract class BaseNotificationFactory {
   protected notification: Notification;
   constructor (notification: Notification) {
      this.notification = notification;
   }
   public notify(): Notification {
      //We can add things that pertain to all notifiables
      //Then call the create method
      
      const notifiable: INotifiable = this.create();
      this.notification.to = notifiable.getTo();

      notifiable.execute();
      return this.notification;
   }
   public abstract create(): INotifiable
}