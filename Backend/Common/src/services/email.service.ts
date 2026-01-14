import { INotifiable, INotifyOptions } from "./INotifiable";
import { UserDto } from "../_dtos";

export class EmailService implements INotifiable {
   message: string;
   constructor(private notifyOptions: INotifyOptions) {
   }
   setType(type: string) {
      return this
   }
   execute(): void {
      throw new Error("Method not implemented.");
   }
}