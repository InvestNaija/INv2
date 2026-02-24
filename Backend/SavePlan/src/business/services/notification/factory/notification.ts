/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { INotifyOptions, NotificationType } from "../INotifiable";

export class Notification {
   public from: string[] = [];
   public to: string[] = [];
   public attachments: any[] = [];
   public template: string = 'default.html';
   public subject: string = '';
   constructor(public type: NotificationType[], private options?: INotifyOptions) {}
}