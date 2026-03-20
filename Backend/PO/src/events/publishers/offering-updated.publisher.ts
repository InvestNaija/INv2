import { Publisher, Subjects, OfferingUpdatedEvent } from "@inv2/common";

export class OfferingUpdatedPublisher extends Publisher<OfferingUpdatedEvent> {
   readonly subject = Subjects.OfferingUpdated;
}
