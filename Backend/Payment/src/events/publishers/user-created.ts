import { Publisher, Subjects, UserCreatedEvent } from "@inv2/common";

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated; 
}