import { controller, httpGet, httpPost, } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator, INLogger, Authentication, UserDto,  } from "@inv2/common";
import { PaymentValidation } from '../validations/payment.schema';

import { PaymentService } from '../../business/services';

@controller("/payment")
export class PaymentController {
   constructor(private readonly pmtSvc: PaymentService){}
   
   @httpGet('/healthz')
   public async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Finance server is Healthy"});
   }
   @httpPost("/init", Authentication.requireAuth,)
   @JoiMWDecorator(PaymentValidation.payment)
   public async initialize(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const body = req.body;
         const user = req.currentUser?.user as unknown as UserDto;
         const payment = await this.pmtSvc.initializePayment(user, body.gateway, body);
         res.status(payment.code).json(payment);
         profiler.done({service: `Finance`, mxessage: `Payment initialized successful => ${JSON.stringify(payment)}`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
      // console.log(cxn.postgres.manager.find(INUser));
      // console.log(await cxn.default?.pgINv2?.models?.User.findAll());
   }
}
