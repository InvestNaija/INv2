import { NextFunction, Request, Response } from 'express';
import { OtpService, CustomError, Exception } from '@inv2/common';
import { User, Op, } from "../../database/sequelize/INv2";
import { PasswordManager } from '../_utils/PasswordManager';
import { redisWrapper } from '../../redis.wrapper';

export class AuthMiddleware {
   static async checkLoginDetails(req: Request, res: Response, next: NextFunction) {
      try {
         const { email, password } = req.body;
         const user = await User.findOne({ 
            where: { email: { [Op.iLike]: email } }, 
            attributes: ["id", "email", "firstName", "password", "twoFactorAuth"],
         });     
         if (!user) throw new Exception({code: 404, message: 'Wrong email or password'});
         const correctPassword = await PasswordManager.compare(user.password, password);
         if (!correctPassword) {
            // const address = req.connection.remoteAddress;
            // const limitRes = await (new RateLimiter).consumeLimit(address);
            // if (limitRes < 2) {
            //    new EmailService({ recipient: user.email, sender: 'info@investnaija.com', subject: 'Unsuccessful Login Attempt' })
            //       .setCustomerDetails(user)
            //       .setEmailType({ type: 'login_failed', meta: user })
            //       .execute();
            // }
            throw new Exception({code: 401, message: `Wrong email or password`});
         }
         req.body = {...req.body, ...user.dataValues};
         next();
      } catch (error) {
         if(error instanceof CustomError) next(new Exception(error));
         else next(error);
      }
   }

   static async check2FA(req: Request, res: Response, next: NextFunction) {
      try {
         const user = req.body;
         if (user && user['twoFactorAuth']) {
            const { token } = req.body;
            const otpService = new OtpService(redisWrapper.client);
            if (!token) {
               await otpService.generateOTP({ user });

               throw new Exception({code: 419, message: '2FA token required',});
            } else {
               const verified = await otpService.verifyOTP({ user, token: user.token });
               if (!verified || !verified.success) {
                  throw new Exception({code: 404, message: verified.message||'OTP Verification Failed'});
               }
            }
         }
    
         next();
      
      } catch (error) {
         if(error instanceof CustomError) next(new Exception(error));
         else next(error);
      }
   }
}
