import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { Authentication, Exception, CustomError, UserDto } from '@inv2/common';
import { OfferingService } from '../../business/services/offering.service';
import { OrderService } from '../../business/services/order.service';

@controller("/offerings")
export class CustomerOfferingController {
   constructor(
      @inject(OfferingService) private readonly offeringSvc: OfferingService,
      @inject(OrderService) private readonly orderSvc: OrderService
   ) {}

   @httpGet("/")
   public async listOfferings(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const offerings = await this.offeringSvc.getAvailableOfferings();
         res.status(200).json({ success: true, data: offerings });
      } catch (error: unknown|Error) {
         next(error);
      }
   }

   @httpGet("/:id")
   public async getOffering(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const offering = await this.offeringSvc.getOfferingById(req.params.id);
         if (!offering) throw new Exception({ code: 404, message: 'Offering not found' });
         res.status(200).json({ success: true, data: offering });
      } catch (error: unknown|Error) {
         if (error instanceof CustomError) next(new Exception(error));
         else next(error);
      }
   }

   @httpPost("/:id/buy", Authentication.requireAuth)
   public async buyOffering(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { id } = req.params;
         const { units, gateway } = req.body;
         const user = req.currentUser?.user as unknown as UserDto;
         
         if (!units || !gateway) {
            throw new Exception({ code: 400, message: 'Units and gateway are required' });
         }

         const orderResult = await this.orderSvc.createOrder(user.id, id, Number(units), gateway);
         res.status(200).json({ success: true, message: 'Order initiated', data: orderResult });
      } catch (error: unknown|Error) {
         if (error instanceof CustomError) next(new Exception(error));
         else next(new Exception({ code: 500, message: (error as Error).message }));
      }
   }
}
