import { controller, httpPost, httpPatch } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { Authentication, Exception, CustomError } from '@inv2/common';
import { OfferingService } from '../../business/services/offering.service';

@controller("/admin/offerings")
export class AdminOfferingController {
   constructor(
      @inject(OfferingService) private readonly offeringSvc: OfferingService
   ) {}

   @httpPost("/", Authentication.requireAuth)
   public async createOffering(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const offering = await this.offeringSvc.createOffering(body);
         res.status(201).json({ success: true, message: 'Offering created successfully', data: offering });
      } catch (error: unknown|Error) {
         if (error instanceof CustomError) next(new Exception(error));
         else next(new Exception({ code: 500, message: (error as Error).message }));
      }
   }

   @httpPatch("/:id", Authentication.requireAuth)
   public async updateOffering(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { id } = req.params;
         const body = req.body;
         const offering = await this.offeringSvc.updateOffering(id, body);
         res.status(200).json({ success: true, message: 'Offering updated successfully', data: offering });
      } catch (error: unknown|Error) {
         if (error instanceof CustomError) next(new Exception(error));
         else next(new Exception({ code: 500, message: (error as Error).message }));
      }
   }
}
