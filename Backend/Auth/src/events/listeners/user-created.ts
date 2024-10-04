import { Listener, Subjects, UserCreatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated; 
   queueName = 'auth-service';
   onMessage(data: UserCreatedEvent['data'], channel: Channel, msg: Message): void {
      console.log(data,);
      
      channel.ack(msg);
   }
}