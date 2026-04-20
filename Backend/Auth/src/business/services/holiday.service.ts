import { injectable, inject } from "inversify";
import moment from "moment";
import { Holiday, Op } from "../../domain/sequelize/INv2";
import { getDbCxn } from "../../domain";
import { HolidayService as HolidayUtils } from "@inv2/common";
import { HolidayCreatedPublisher, HolidayUpdatedPublisher, HolidayDeletedPublisher } from "../../events/publishers";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";

/**
 * Holiday Service (Auth)
 * Acts as the Source of Truth for holidays across the system.
 * Manages holidays in the Auth database, maintains a shared Redis cache,
 * and publishes events to RabbitMQ when holidays are mutated.
 */
@injectable()
export class HolidayService {
   constructor() {}

   private get holidayRepo() {
      return getDbCxn('pgINv2')?.getRepository(Holiday);
   }

   public async createHoliday(data: any) {
      const holiday = await this.holidayRepo!.create(data);
      
      await new HolidayCreatedPublisher(rabbitmqWrapper.connection).publish(holiday.toJSON());

      return holiday;
   }

   public async updateHoliday(id: string, data: any) {
      const holiday = await this.holidayRepo!.findByPk(id);
      if (!holiday) throw new Error("Holiday not found");
      await holiday.update(data);

      await new HolidayUpdatedPublisher(rabbitmqWrapper.connection).publish(holiday.toJSON());

      return holiday;
   }

   public async deleteHoliday(id: string) {
      const holiday = await this.holidayRepo!.findByPk(id);
      if (!holiday) throw new Error("Holiday not found");
      const holidayData = holiday.toJSON();
      await holiday.destroy();

      await new HolidayDeletedPublisher(rabbitmqWrapper.connection).publish(holidayData);

      return true;
   }

   public async getHoliday(id: string) {
      return await this.holidayRepo!.findByPk(id);
   }

   public async getAllHolidays(condition: any = {}) {
      return await this.holidayRepo!.findAndCountAll({
         where: condition,
         order: [["startDate", "ASC"]]
      });
   }

   public async getHolidayList() {
      const holidays = await this.holidayRepo!.findAll({
         where: { isObserved: true },
         order: [["startDate", "ASC"]]
      });
      return holidays;
   }

   public async isHoliday(date: string): Promise<boolean> {
      const holidays = await this.getHolidayList();
      return HolidayUtils.isHoliday(date, holidays as any);
   }

   public async getNextBusinessDay(date: string): Promise<string> {
      const holidays = await this.getHolidayList();
      return HolidayUtils.getNextBusinessDay(date, holidays as any);
   }

   public async getPreviousBusinessDay(date: string): Promise<string> {
      const holidays = await this.getHolidayList();
      return HolidayUtils.getPreviousBusinessDay(date, holidays as any);
   }
}
