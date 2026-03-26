import { Message, Channel } from 'amqplib';
import { Listener, Subjects, HolidayUpdatedEvent } from '@inv2/common';
import { IHolidayRepository } from '../../domain/sequelize/repositories/holiday.repository';

/**
 * Holiday Updated Listener
 * Processes 'holiday:updated' events from the Auth service.
 * Updates the existing holiday record in the local InvestIN replica.
 */
export class HolidayUpdatedListener extends Listener<HolidayUpdatedEvent> {
   readonly subject = Subjects.HolidayUpdated;
   queueName = 'investin-holiday-service';

   constructor(connection: any, private holidayRepository: IHolidayRepository) {
      super(connection);
   }

   async onMessage(data: HolidayUpdatedEvent['data'], channel: Channel, msg: Message) {
      try {
         console.log('Event received: HolidayUpdated', data.id);
         const { id, name, startDate, endDate, isObserved, version } = data;

         const holiday = await this.holidayRepository.findById(id);
         if (holiday) {
            await this.holidayRepository.update(id, {
               name,
               startDate: new Date(startDate),
               endDate: new Date(endDate),
               isObserved,
               version,
            });
         } else {
            // If it doesn't exist yet, we can create it (resilience)
            await this.holidayRepository.create({
               id,
               name,
               startDate: new Date(startDate),
               endDate: new Date(endDate),
               isObserved,
               version,
            });
         }

         channel.ack(msg);
      } catch (err: any) {
         console.error('Error processing HolidayUpdated event:', err.message);
      }
   }
}
