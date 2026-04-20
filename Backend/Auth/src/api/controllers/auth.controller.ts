import { controller, httpGet, httpPost, } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator, INLogger, RateLimiter, Authentication } from "@inv2/common";
import { AuthValidation } from '../validations/auth.schema';

import { AuthService } from '../../business/services';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@controller("")
export class AuthController {
   constructor(private readonly authSvc: AuthService){}
   
   @httpGet('/healthz')
   public async healthz(req: Request, res: Response): Promise<void> {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Auth service health check'
      res.status(200).json({status:200, message: "Auth server is Healthy"});
   }
   @httpPost("/user/signup")
   @JoiMWDecorator(AuthValidation.signup)
   public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Register a new user'
      /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'User registration details',
            required: true,
            schema: { $ref: '#/definitions/SignupRequest' }
      } */
      const profiler = INLogger.log.startTimer();
      try {         
         const body = req.body;
         const user = await this.authSvc.signup(body);
         res.status(user.code).json(user);
         profiler.done({service: `Auth`, message: `Signup successful. User: ${JSON.stringify(user)}`});
      } catch (error: unknown|Error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }
   @httpPost("/user/register-dependent", Authentication.requireAuth)
   @JoiMWDecorator(AuthValidation.registerDependent)
   public async registerDependent(req: Request, res: Response, next: NextFunction): Promise<void> {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Register a dependent (Minor)'
      // #swagger.security = [{ "bearerAuth": [] }]
      /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dependent registration details',
            required: true,
            schema: { $ref: '#/definitions/RegisterDependentRequest' }
      } */
      const profiler = INLogger.log.startTimer();
      try {
         const body = req.body;
         const guardianId = req.currentUser!.user.id;
         if (!guardianId) throw new Exception({ code: 401, message: `Unauthorized` });
         const dependant = await this.authSvc.registerDependent(body, guardianId);
         res.status(dependant.code).json(dependant);
         profiler.done({ service: `Auth`, message: `Dependent registered successfully by Guardian: ${guardianId}` });
      } catch (error) {
         if (error instanceof CustomError) next(new Exception(error));
         else next(error);
      }
   }

   @httpPost("/user/signin", AuthMiddleware.checkLoginDetails, RateLimiter.limit({max: 10, windowMs: 60000, subject: "Login"}))
   @httpPost("/user/signin-choose-tenant")
   // @JoiMWDecorator(AuthValidation.login)
   public async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'User sign-in'
      /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'User login credentials',
            required: true,
            schema: { $ref: '#/definitions/SigninRequest' }
      } */
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
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Enable/Disable 2FA'
      // #swagger.security = [{ "bearerAuth": [] }]
      /* #swagger.parameters['body'] = {
            in: 'body',
            description: '2FA settings',
            required: true,
            schema: { $ref: '#/definitions/Set2FARequest' }
      } */
      const profiler = INLogger.log.startTimer();
      try {
         const set2FA = await this.authSvc.set2FA(req.currentUser!, req.body);
         res.status(set2FA.code).json(set2FA);
         profiler.done({service: `Auth`, message: `set2FA successful. User: ${req.currentUser!.user.id}`});
      } catch (error) {
         if(error instanceof CustomError) next( new Exception(error));
      }
   }

   @httpPost("/user/change-password", Authentication.requireAuth)
   @JoiMWDecorator(AuthValidation.changePassword)
   public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Change password'
      // #swagger.security = [{ "bearerAuth": [] }]
      /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'Password change details',
            required: true,
            schema: { $ref: '#/definitions/ChangePasswordRequest' }
      } */
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.authSvc.changePassword(req.currentUser!.user.id!, req.body);
         res.status(result.code).json(result);
         profiler.done({ service: `Auth`, message: `Password change successful for: ${req.currentUser!.user.id}` });
      } catch (error) {
         if (error instanceof CustomError) next(new Exception(error));
      }
   }
   @httpPost("/user/forgot-password")
   @JoiMWDecorator(AuthValidation.forgotPassword)
   public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Forgot password'
      /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'Email for password reset',
            required: true,
            schema: { $ref: '#/definitions/ForgotPasswordRequest' }
      } */
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.authSvc.forgotPassword(req.body.email);
         res.status(result.code).json(result);
         profiler.done({ service: `Auth`, message: `Forgot password OTP sent to: ${req.body.email}` });
      } catch (error) {
         if (error instanceof CustomError) next(new Exception(error));
      }
   }

   @httpPost("/user/reset-password")
   @JoiMWDecorator(AuthValidation.resetPassword)
   public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Reset password with OTP'
      /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'Password reset details',
            required: true,
            schema: { $ref: '#/definitions/ResetPasswordRequest' }
      } */
      const profiler = INLogger.log.startTimer();
      try {
         const result = await this.authSvc.resetPassword(req.body);
         res.status(result.code).json(result);
         profiler.done({ service: `Auth`, message: `Password reset successful for: ${req.body.email}` });
      } catch (error) {
         if (error instanceof CustomError) next(new Exception(error));
      }
   }

}