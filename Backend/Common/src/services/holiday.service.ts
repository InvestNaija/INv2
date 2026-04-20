import moment from 'moment';

export interface IHoliday {
   id: string;
   name: string;
   startDate: string | Date;
   endDate: string | Date;
   isObserved: boolean;
}

/**
 * Holiday Service Utilities
 * Storage-agnostic business logic for holiday and business day calculations.
 */
export class HolidayService {
   /**
    * Checks if a given date is a holiday.
    * @param date Date string in any moment-parsable format.
    * @param holidays List of IHoliday objects to check against.
    */
   public static isHoliday(date: string, holidays: IHoliday[]): boolean {
      const checkDate = moment(date).format('YYYY-MM-DD');
      return holidays.some(h => {
         const start = moment(h.startDate).format('YYYY-MM-DD');
         const end = moment(h.endDate).format('YYYY-MM-DD');
         return moment(checkDate).isBetween(start, end, undefined, '[]');
      });
   }

   /**
    * Returns the next business day (skipping weekends and holidays).
    */
   public static getNextBusinessDay(date: string, holidays: IHoliday[]): string {
      let current = moment(date).add(1, 'days');
      while (current.day() === 0 || current.day() === 6 || this.isHoliday(current.format('YYYY-MM-DD'), holidays)) {
         current = current.add(1, 'days');
      }
      return current.format('YYYY-MM-DD');
   }

   /**
    * Returns the previous business day (skipping weekends and holidays).
    */
   public static getPreviousBusinessDay(date: string, holidays: IHoliday[]): string {
      let current = moment(date).subtract(1, 'days');
      while (current.day() === 0 || current.day() === 6 || this.isHoliday(current.format('YYYY-MM-DD'), holidays)) {
         current = current.subtract(1, 'days');
      }
      return current.format('YYYY-MM-DD');
   }
}
