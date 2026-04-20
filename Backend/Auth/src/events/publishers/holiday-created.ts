import { Publisher, Subjects, HolidayCreatedEvent } from "@inv2/common";

/**
 * Holiday Created Publisher
 * Emits an event when a new holiday is created in the Auth service.
 */
export class HolidayCreatedPublisher extends Publisher<HolidayCreatedEvent> {
   readonly subject = Subjects.HolidayCreated; 
}
