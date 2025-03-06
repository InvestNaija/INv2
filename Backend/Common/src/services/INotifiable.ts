import { UserDto } from "../_dtos";

export interface INotifiable {
   // recipient: Partial<UserDto>
   setType(type: string): this;
   execute(): void;
}

export interface INotifyOptions {
   /** Partial UserDto, */
   sender: Partial<UserDto>;
   /** Partial UserDto, */
   recipient: (Partial<UserDto> & Required<Pick<UserDto, 'firstName'>>)[];
   /** Message to be sent */
   message: any;
}