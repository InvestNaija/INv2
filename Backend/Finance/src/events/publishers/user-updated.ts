import { Publisher, Subjects, UserUpdatedEvent } from "@inv2/common";

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
   readonly subject = Subjects.UserUpdated; 
}