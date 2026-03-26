import { Publisher, Subjects, HolidayUpdatedEvent } from "@inv2/common";

/**
 * Holiday Updated Publisher
 * Emits an event when a holiday record is updated in the Auth service.
 */
export class HolidayUpdatedPublisher extends Publisher<HolidayUpdatedEvent> {
   readonly subject = Subjects.HolidayUpdated; 
}
