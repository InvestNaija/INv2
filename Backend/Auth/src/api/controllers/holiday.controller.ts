import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, INLogger } from "@inv2/common";
import { inject } from 'inversify';
import { HolidayService } from '../../business/services/holiday.service';
import { TYPES } from '../../business/types';

@controller("/holidays")
export class HolidayController {
   constructor(
      @inject(TYPES.HolidayService) private readonly holidayService: HolidayService
   ) {}

   @httpPost("/")
   public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {
         const holiday = await this.holidayService.createHoliday(req.body);
         res.status(201).json({
            status: "success",
            message: "Holiday created successfully",
            data: holiday
         });
         profiler.done({ service: "Auth", message: `Holiday created: ${holiday.id}` });
      } catch (error: any) {
         if (error instanceof CustomError) next(new Exception(error as any));
         else next(error);
      }
   }

   @httpPut("/:id")
   public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {
         const { id } = req.params;
         const holiday = await this.holidayService.updateHoliday(id, req.body);
         res.status(200).json({
            status: "success",
            message: "Holiday updated successfully",
            data: holiday
         });
         profiler.done({ service: "Auth", message: `Holiday updated: ${id}` });
      } catch (error: any) {
         if (error instanceof CustomError) next(new Exception(error as any));
         else next(error);
      }
   }

   @httpGet("/:id")
   public async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { id } = req.params;
         const holiday = await this.holidayService.getHoliday(id);
         if (!holiday) throw new Exception({ message: "Holiday not found", code: 404 });
         res.status(200).json({
            status: "success",
            data: holiday
         });
      } catch (error: any) {
         if (error instanceof CustomError) next(new Exception(error as any));
         else next(error);
      }
   }

   @httpGet("/")
   public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { count, rows } = await this.holidayService.getAllHolidays(req.query);
         res.status(200).json({
            status: "success",
            totalItems: count,
            data: rows
         });
      } catch (error: any) {
         if (error instanceof CustomError) next(new Exception(error as any));
         else next(error);
      }
   }

   @httpDelete("/:id")
   public async _delete(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {
         const { id } = req.params;
         await this.holidayService.deleteHoliday(id);
         res.status(200).json({
            status: "success",
            message: "Holiday deleted successfully"
         });
         profiler.done({ service: "Auth", message: `Holiday deleted: ${id}` });
      } catch (error: any) {
         if (error instanceof CustomError) next(new Exception(error as any));
         else next(error);
      }
   }
}
