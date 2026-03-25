import { injectable, inject } from "inversify";
import moment from "moment";
import { Holiday, Op } from "../../domain/sequelize/INv2";
import { redisWrapper } from "../../redis.wrapper";
import { RedisService, HolidayService as CommonHolidayService } from "@inv2/common";

@injectable()
export class HolidayService {
   private redisSvc: RedisService;
   private commonHolidaySvc: CommonHolidayService;

   constructor() {
      this.redisSvc = new RedisService(redisWrapper.client);
      this.commonHolidaySvc = new CommonHolidayService(this.redisSvc);
   }

   public async createHoliday(data: any) {
      const holiday = await Holiday.create(data);
      await this.clearCache();
      return holiday;
   }

   public async updateHoliday(id: string, data: any) {
      const holiday = await Holiday.findByPk(id);
      if (!holiday) throw new Error("Holiday not found");
      await holiday.update(data);
      await this.clearCache();
      return holiday;
   }

   public async deleteHoliday(id: string) {
      const holiday = await Holiday.findByPk(id);
      if (!holiday) throw new Error("Holiday not found");
      await holiday.destroy();
      await this.clearCache();
      return true;
   }

   public async getHoliday(id: string) {
      return await Holiday.findByPk(id);
   }

   public async getAllHolidays(condition: any = {}) {
      return await Holiday.findAndCountAll({
         where: condition,
         order: [["startDate", "ASC"]]
      });
   }

   public async getHolidayList() {
      const holidays = await Holiday.findAll({
         where: { isObserved: true },
         order: [["startDate", "ASC"]]
      });
      await this.redisSvc.set(process.env.HOLIDAY_CACHE_KEY!, JSON.stringify(holidays), 3600);
      return holidays;
   }

   public async isHoliday(date: string): Promise<boolean> {
      return await this.commonHolidaySvc.isHoliday(date);
   }

   public async getNextBusinessDay(date: string): Promise<string> {
      return await this.commonHolidaySvc.getNextBusinessDay(date);
   }

   public async getPreviousBusinessDay(date: string): Promise<string> {
      return await this.commonHolidaySvc.getPreviousBusinessDay(date);
   }

   private async clearCache() {
   await this.redisSvc.del(process.env.HOLIDAY_CACHE_KEY!);
   }
}
