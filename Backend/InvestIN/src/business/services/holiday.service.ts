import { injectable, inject } from 'inversify';
import moment from 'moment';
import { TYPES } from '../types';
import { HolidayService as HolidayUtils } from '@inv2/common';
import { IHolidayRepository } from '../../domain/sequelize/repositories/holiday.repository';

/**
 * Holiday Service
 * Provides business logic for holiday and business day calculations.
 * Uses a local read-only replica of holidays synchronization from the Auth service.
 */
@injectable()
export class HolidayService {
   constructor(
      @inject(TYPES.HolidayRepository) private readonly holidayRepository: IHolidayRepository
   ) {}

   public async isHoliday(date: string): Promise<boolean> {
      const holidays = await this.holidayRepository.findAll();
      return HolidayUtils.isHoliday(date, holidays as any);
   }

   public async getNextBusinessDay(date: string): Promise<string> {
      const holidays = await this.holidayRepository.findAll();
      return HolidayUtils.getNextBusinessDay(date, holidays as any);
   }

   public async getPreviousBusinessDay(date: string): Promise<string> {
      const holidays = await this.holidayRepository.findAll();
      return HolidayUtils.getPreviousBusinessDay(date, holidays as any);
   }
}
