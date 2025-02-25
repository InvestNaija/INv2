import { Channel, Message } from "amqplib";
import { Listener, Subjects, LogCreatedEvent, Validate, moment } from "@inv2/common";
import { LogService } from '../../main/services/log.service';
import { LogValidation } from '../../main/validations';

export class LogCreatedListener extends Listener<LogCreatedEvent> {
   readonly subject = Subjects.LogCreated; 
   queueName = 'log-service';
   async onMessage(data: LogCreatedEvent['data'], channel: Channel, msg: Message): Promise<void> {
      try {
         console.log("Got a new log information", data,);
         
         const timestamp = moment(data.timestamp, 'MMM-DD-YYYY HH:mm:ss').toDate(); 
         const error = Validate(LogValidation.create, { body: {...data, timestamp} });
         if (error) throw new Error(error.message);

         const logService = new LogService;
         const log = await logService.create(data)
         
         channel.ack(msg);
      } catch (err) {
         const error = (err as Error);
         console.error(error!.message,);
      }

   }
}