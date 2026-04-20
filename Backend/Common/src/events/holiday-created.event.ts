import { Subjects } from "./subjects";

export interface HolidayEventInfo {
   id: string;
   name: string;
   startDate: string | Date;
   endDate: string | Date;
   isObserved: boolean;
   version?: number;
   createdAt?: string | Date;
   updatedAt?: string | Date;
}

export interface HolidayCreatedEvent {
   subject: Subjects.HolidayCreated;
   data: HolidayEventInfo;
}
