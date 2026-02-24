/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { INotifiable, INotifyOptions } from "../INotifiable";

export class SMSManager implements INotifiable {
   constructor(private notifyOptions?: INotifyOptions) {
   }
   getTo(): string[] {
      return (this.notifyOptions?.to.map(user => user.phone) as string[]);
   }
   execute(): void {
      console.log(`Logged this to SMS`);
   }
}