import { Subjects } from "./subjects";

export interface UserUpdatedEvent {
   subject: Subjects.UserUpdated;
   data: {
      id: string;
      version: number;
      title: string;
      price: number;
      userId: string;
      orderId?: string;
   }
}