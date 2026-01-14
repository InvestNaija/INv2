import { Publisher, Subjects, SaveplanUpdatedEvent } from "@inv2/common";

export class SaveplanUpdatedPublisher extends Publisher<SaveplanUpdatedEvent> {
   readonly subject = Subjects.SaveplanUpdated; 
}