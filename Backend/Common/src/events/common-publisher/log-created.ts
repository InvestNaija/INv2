import { Publisher } from "../base/publisher";
import { Subjects } from "../subjects";
import { LogCreatedEvent } from "../log-created.event";

export class LogCreatedPublisher extends Publisher<LogCreatedEvent> {
   readonly subject = Subjects.LogCreated; 
}