/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { INotifiable, INotifyOptions } from "../INotifiable";

export class EmailManager implements INotifiable {
   // attachments: any[] = [];
   subject: string = '';
   constructor(private notifyOptions?: INotifyOptions) {
   }
   getTo(): string[] {
      return (this.notifyOptions?.to.map(user => user.email) as string[]);
   }
   // public addAttachment(attachments: any[]) : any[] {
   //    console.log(`Attachments added to emails`);
   //    this.attachments = attachments;
   //    console.log(this.attachments);
      
   //    return attachments;
   // }
   execute(): void {
      console.log(`Logged this to Email`, this.getTo());
   }
}