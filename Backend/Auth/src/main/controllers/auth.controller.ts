import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator } from "@inv2/common";
import { AuthValidation } from '../validations/auth.schema';

import { AuthService } from '../services';

export class AuthController {
   public static async healthz(req: Request, res: Response): Promise<void> {
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }
   @JoiMWDecorator(AuthValidation.signup)
   public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
      // const profiler = Logger.logger.startTimer();
      try {         
         const body = req.body;
         const authService = new AuthService;
         const user = await authService.signup(body);
         res.status(user.code).json(user);
         // profiler.done({message: `Finished processing login request`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
      // console.log(cxn.postgres.manager.find(INUser));
      // console.log(await cxn.default?.pgINv2?.models?.User.findAll());
   }
   @JoiMWDecorator(AuthValidation.login)
   public static async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const body = req.body;
         const authService = new AuthService;
         const user = await authService.signin(body);
         res.status(user.code).json(user);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @JoiMWDecorator(AuthValidation.set2FA)
   public static async set2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const authService = new AuthService;
         const set2FA = await authService.set2FA(req.currentUser!, req.body);
         res.status(set2FA.code).json(set2FA);
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
}