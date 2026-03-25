/* eslint-disable @typescript-eslint/no-explicit-any */
import { INLogger } from '@inv2/common';
import { TYPES } from '../../business/types';
import { HolidayService } from '../../business/services/holiday.service';
import { inject, injectable } from 'inversify';

@injectable()
export class GRPHolidayService {
   constructor(
      @inject(TYPES.HolidayService)
      private readonly holidaySvc: HolidayService 
   ){ }

   public IsHoliday = async (call: any, callback: any): Promise<void> => {
      try {
         const { date } = call.request;
         const isHoliday = await this.holidaySvc.isHoliday(date);
         callback(null, { value: isHoliday });
      } catch (error) {
         INLogger.log.error('gRPC IsHoliday failed', error);
         callback(error as any);
      }
   };

   public GetNextBusinessDay = async (call: any, callback: any): Promise<void> => {
      try {
         const { date } = call.request;
         const nextDay = await this.holidaySvc.getNextBusinessDay(date);
         callback(null, { date: nextDay });
      } catch (error) {
         INLogger.log.error('gRPC GetNextBusinessDay failed', error);
         callback(error as any);
      }
   };

   public GetPreviousBusinessDay = async (call: any, callback: any): Promise<void> => {
      try {
         const { date } = call.request;
         const prevDay = await this.holidaySvc.getPreviousBusinessDay(date);
         callback(null, { date: prevDay });
      } catch (error) {
         INLogger.log.error('gRPC GetPreviousBusinessDay failed', error);
         callback(error as any);
      }
   };

   public GetHolidayList = async (call: any, callback: any): Promise<void> => {
      try {
         const holidays = await this.holidaySvc.getHolidayList();
         callback(null, { holidays: holidays.map(h => ({
            id: h.id,
            name: h.name,
            startDate: h.startDate.toString(),
            endDate: h.endDate.toString(),
            isObserved: h.isObserved
         })) });
      } catch (error) {
         INLogger.log.error('gRPC GetHolidayList failed', error);
         callback(error as any);
      }
   };
}
