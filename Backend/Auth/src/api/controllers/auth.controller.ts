import { controller, httpGet, httpPost, } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator, INLogger } from "@inv2/common";
import { AuthValidation } from '../validations/auth.schema';

import { AuthService } from '../../business/services';

@controller("/auth")
export class AuthController {
   constructor(private readonly authSvc: AuthService){}
   
   @httpGet('/healthz')
   public async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }
   @httpPost("/user/signup")
   @JoiMWDecorator(AuthValidation.signup)
   public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const body = req.body;
         const user = await this.authSvc.signup(body);
         res.status(user.code).json(user);
         profiler.done({service: `Auth`, message: `Signup successful. User: ${JSON.stringify(user)}`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
      // console.log(cxn.postgres.manager.find(INUser));
      // console.log(await cxn.default?.pgINv2?.models?.User.findAll());
   }
   @httpPost("/user/signin")
   @httpPost("/user/signin-choose-tenant")
   // @JoiMWDecorator(AuthValidation.login)
   public async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {
         const body = req.body;
         const user = await this.authSvc.signin(body);
         res.status(user.code).json(user);
         profiler.done({service: `Auth`, message: `Login successful. User: ${user.data.user.id}`});
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @httpPost("/user/set-2FA")
   @JoiMWDecorator(AuthValidation.set2FA)
   public async set2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const set2FA = await this.authSvc.set2FA(req.currentUser!, req.body);
         res.status(set2FA.code).json(set2FA);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}