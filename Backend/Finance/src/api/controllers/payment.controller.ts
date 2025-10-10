import { controller, httpGet, httpPost, } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator, INLogger } from "@inv2/common";
import { PaymentValidation } from '../validations/payment.schema';

import { AuthService } from '../../business/services';

@controller("/payment")
export class PaymentController {
   constructor(private readonly authSvc: AuthService){}
   
   @httpGet('/healthz')
   public async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Finance server is Healthy"});
   }
   @httpPost("/init")
   @JoiMWDecorator(PaymentValidation.payment)
   public async initialize(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const body = req.body;
         const user = await this.authSvc.signup(body);
         res.status(user.code).json(user);
         profiler.done({service: `Finance`, mxessage: `Signup successful. User: ${JSON.stringify(user)}`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
      // console.log(cxn.postgres.manager.find(INUser));
      // console.log(await cxn.default?.pgINv2?.models?.User.findAll());
   }
}
