/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { UserDto } from "@inv2/common";

export interface INotifiable {
   // recipient: Partial<UserDto>
   getTo(): string[];
   execute(): void;
}

export interface INotifyOptions {
   /** Partial UserDto, */
   from: Partial<UserDto>;
   /** Partial UserDto, */
   to: (Partial<UserDto> & Required<Pick<UserDto, 'firstName'>>)[];
   /** Message to be sent */
   message: any;
}

export enum NotificationType {
   EMAIL= 'email',
   SMS = 'sms'
}