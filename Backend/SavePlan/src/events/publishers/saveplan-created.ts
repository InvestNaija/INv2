import { Publisher, Subjects, SaveplanCreatedEvent } from "@inv2/common";

export class SaveplanCreatedPublisher extends Publisher<SaveplanCreatedEvent> {
   readonly subject = Subjects.SaveplanCreated; 
}