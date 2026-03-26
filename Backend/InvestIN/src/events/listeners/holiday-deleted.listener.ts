import { Message, Channel } from 'amqplib';
import { Listener, Subjects, HolidayDeletedEvent } from '@inv2/common';
import { IHolidayRepository } from '../../domain/sequelize/repositories/holiday.repository';

/**
 * Holiday Deleted Listener
 * Processes 'holiday:deleted' events from the Auth service.
 * Removes the sync'd record from the local InvestIN database.
 */
export class HolidayDeletedListener extends Listener<HolidayDeletedEvent> {
   readonly subject = Subjects.HolidayDeleted;
   queueName = 'investin-holiday-service';

   constructor(connection: any, private holidayRepository: IHolidayRepository) {
      super(connection);
   }

   async onMessage(data: HolidayDeletedEvent['data'], channel: Channel, msg: Message) {
      try {
         console.log('Event received: HolidayDeleted', data.id);
         const { id } = data;

         await this.holidayRepository.delete(id);

         channel.ack(msg);
      } catch (err: any) {
         console.error('Error processing HolidayDeleted event:', err.message);
      }
   }
}
