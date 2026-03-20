import { Publisher, Subjects, OfferingCreatedEvent } from "@inv2/common";

export class OfferingCreatedPublisher extends Publisher<OfferingCreatedEvent> {
   readonly subject = Subjects.OfferingCreated;
}
