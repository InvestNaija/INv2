import { Publisher, Subjects, HolidayDeletedEvent } from "@inv2/common";

/**
 * Holiday Deleted Publisher
 * Emits an event when a holiday is removed from the Auth service.
 */
export class HolidayDeletedPublisher extends Publisher<HolidayDeletedEvent> {
   readonly subject = Subjects.HolidayDeleted; 
}
