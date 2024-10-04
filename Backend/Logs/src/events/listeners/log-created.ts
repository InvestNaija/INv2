import { Listener, Subjects, LogCreatedEvent, Validate, Exception } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { LogService } from '../../main/services/log.service';
import { LogValidation } from '../../main/validations';

export class LogCreatedListener extends Listener<LogCreatedEvent> {
   readonly subject = Subjects.LogCreated; 
   queueName = 'log-service';
   async onMessage(data: LogCreatedEvent['data'], channel: Channel, msg: Message): Promise<void> {
      console.log("Got a new log information", data,);
      const error = Validate(LogValidation.create, { body: data });
      if (error) {
         throw new Error(error.message);
      }
      const logService = new LogService;
      const log = await logService.create(data)
      
      channel.ack(msg);
   }
}