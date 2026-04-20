import { NextFunction, Request, Response } from 'express';
import { OtpService, CustomError, Exception, RSAEncryption, RateLimiter, EmailBuilderService } from '@inv2/common';
import { User, Op, } from "../../domain/sequelize/INv2";
import { PasswordManager } from '../../_utils/PasswordManager';
import { redisWrapper } from '../../redis.wrapper';

export class AuthMiddleware {
   static async checkLoginDetails(req: Request, res: Response, next: NextFunction) {
      try {
         let { email, password } = req.body;
         const normalizedEmail = email.toLowerCase();
         try {
            password = (new RSAEncryption({privateKey: process.env.RSA_GENERAL_PRIVATE_KEY  })).decrypt(password);
         } catch {
            throw new Exception({code: 400, message: `Login failed: Password was corrupted`});
         }
         const user = await User.findOne({ 
            where: { email: {[Op[User.sequelize?.getDialect()==='postgres'?'iLike':'like']]: email} }, 
            attributes: ["id", "email", "firstName", "lastName", "password", "twoFactorAuth", "isLocked"],
         });

         if (!user) throw new Exception({code: 404, message: 'Wrong email or password'});
         
         // 1. Check if account is locked in DB or Redis
         if (user.isLocked) {
            throw new Exception({code: 403, message: `Account locked due to too many failed attempts. Please reset your password to regain access.`});
         }

         const loginLimiter = RateLimiter.getRawLimiter('login_failed', 3, 86400000); // 24 hours
         const rateLimitRes = await loginLimiter.get(normalizedEmail);
         
         if (rateLimitRes && rateLimitRes.consumedPoints >= 3) {
            throw new Exception({code: 403, message: `Account locked due to too many failed attempts. Please reset your password to regain access.`});
         }

         const correctPassword = await PasswordManager.compare(user.password, password);
         if (!correctPassword) {
            // 2. Increment failed attempts in Redis
            try {
               const resConsume = await loginLimiter.consume(normalizedEmail);
               const remaining = 3 - resConsume.consumedPoints;
               throw new Exception({code: 401, message: `Wrong email or password. ${remaining} attempts left.`});
            } catch (rateLimitError: any) {
               // 3. Strike 3 reached: Lockout
               if (rateLimitError.consumedPoints >= 3) {
                  await user.update({ isLocked: true, isEnabled: false });

                  // Trigger Lockout Email
                  new EmailBuilderService({
                     recipient: user.email, 
                     sender: 'no-reply@investnaija.com', 
                     subject: 'Security Alert: Account Locked'
                  })
                     .setCustomerDetails(user as any)
                     .setEmailType({
                        type: 'login_failed',
                        meta: { 
                           name: user.firstName,
                           message: `
                           <p>Your InvestNaija account has been locked due to 3 failed login attempts.</p>
                           <p>If this was you, please reset your password using the "Forgot Password" link on the login page to regain access.</p>
                           <p>If this wasn't you, please contact our support team immediately.</p>
                           `
                        }
                     })
                     .execute();            
                  
                  throw new Exception({code: 419, message: 'Too many failed attempts. Your account has been locked. Please check your email for instructions to reset your password.'});
               }
               throw rateLimitError;
            }
         }

         // 4. Reset failed attempts on successful login
         await loginLimiter.delete(normalizedEmail);
         
         req.body = {...req.body, ...user.dataValues};
         next();
      } catch (error) {
         console.log(error);
         
         if(error instanceof CustomError) next(new Exception(error));
         else next(error);
      }
   }

   static async check2FA(req: Request, res: Response, next: NextFunction) {
      try {
         const user = req.body;
         if (user && user['twoFactorAuth']) {
            const { token } = req.body;
            const otpService = new OtpService(redisWrapper.client as any);
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
