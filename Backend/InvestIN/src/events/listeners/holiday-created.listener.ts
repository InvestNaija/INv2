import { Message, Channel } from 'amqplib';
import { Listener, Subjects, HolidayCreatedEvent } from '@inv2/common';
import { IHolidayRepository } from '../../domain/sequelize/repositories/holiday.repository';

/**
 * Holiday Created Listener
 * Processes 'holiday:created' events from the Auth service.
 * Replicates the new holiday into the local InvestIN database.
 */
export class HolidayCreatedListener extends Listener<HolidayCreatedEvent> {
   readonly subject = Subjects.HolidayCreated;
   queueName = 'investin-holiday-service';

   constructor(connection: any, private holidayRepository: IHolidayRepository) {
      super(connection);
   }

   async onMessage(data: HolidayCreatedEvent['data'], channel: Channel, msg: Message) {
      try {
         console.log('Event received: HolidayCreated', data.id);
         const { id, name, startDate, endDate, isObserved, version } = data;

         await this.holidayRepository.create({
            id,
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isObserved,
            version,
         });

         channel.ack(msg);
      } catch (err: any) {
         console.error('Error processing HolidayCreated event:', err.message);
         // Optionally nack the message if it's a transient error
      }
   }
}
