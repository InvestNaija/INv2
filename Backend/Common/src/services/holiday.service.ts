import moment from "moment";
import { RedisService } from "./redis.service";

export interface IHoliday {
   id: string;
   name: string;
   startDate: string | Date;
   endDate: string | Date;
   isObserved: boolean;
}

export class HolidayService {

   constructor(private redis: RedisService) {}

   public async getHolidayList(): Promise<IHoliday[]> {
      const cached = await this.redis.get(process.env.HOLIDAY_CACHE_KEY);
      if (cached) {
         return JSON.parse(cached);
      }
      return [];
   }

   public async isHoliday(date: string): Promise<boolean> {
      const checkDate = moment(date).format("YYYY-MM-DD");
      const holidays = await this.getHolidayList();
      
      return holidays.some(h => {
         const start = moment(h.startDate).format("YYYY-MM-DD");
         const end = moment(h.endDate).format("YYYY-MM-DD");
         return moment(checkDate).isBetween(start, end, undefined, '[]');
      });
   }

   public async getNextBusinessDay(date: string): Promise<string> {
      let current = moment(date).add(1, "days");
      while (current.day() === 0 || current.day() === 6 || await this.isHoliday(current.format("YYYY-MM-DD"))) {
         current = current.add(1, "days");
      }
      return current.format("YYYY-MM-DD");
   }

   public async getPreviousBusinessDay(date: string): Promise<string> {
      let current = moment(date).subtract(1, "days");
      while (current.day() === 0 || current.day() === 6 || await this.isHoliday(current.format("YYYY-MM-DD"))) {
         current = current.subtract(1, "days");
      }
      return current.format("YYYY-MM-DD");
   }
}
