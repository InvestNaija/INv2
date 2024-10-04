import { Subjects } from "./subjects";

export interface LogCreatedEvent {
   subject: Subjects.LogCreated;
   data: {
      service: string;
      level: string;
      message: string;
      timestamp: Date
   }
}