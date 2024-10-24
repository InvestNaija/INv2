import { Publisher, Subjects, UserCreatedEvent } from "@inv2/common";

export class LmsCreatedPublisher extends Publisher<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated; 
}