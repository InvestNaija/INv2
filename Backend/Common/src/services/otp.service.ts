import { RedisClientType } from 'redis';
import { Helper } from '../_utils/helper';
import { Exception } from '../errors/custom-error';
import { EmailBuilderService } from './email-builder.service';

interface IOtpParams {
   user: {
      id: string;
      email: string;
      name: string;
   };
   token?: string;
   sender?: string
   subject?: string;
   message?: string;
}
interface IOTP {
   otp: string;
   createdAt: Date;
}
export class OtpService {
   constructor(private client: RedisClientType) {}
   async generateOTP ({user, sender, subject, message}: IOtpParams) {
      // const tokenExists = await this.client.get(email);
      let otp = Helper.generateOTCode(6, false);
      await this.client.setEx(user.email, 600, JSON.stringify({otp, createdAt: new Date}));
      console.log(`OTP ${otp} generated for user`, user);
      
      await new EmailBuilderService({ recipient: user.email, sender: sender??'info@investnaija.com', subject: (subject??'One Time Password')+` <${otp}>` })
         .setCustomerDetails(user)
         .setEmailType({ type: 'resend_otp', meta: { user, otp, message } })
         .execute();
      return { success: true, token: otp, message: 'OTP generated successfully'};
   }

   async verifyOTP (params: IOtpParams) {
      const tokenExists = await this.client.get(params.user.email);
      if (!tokenExists)
         return { success: false, status: 403, message: `Invalid or expired token`, data: params};

      const token = (JSON.parse(tokenExists) as IOTP);
      const checkToken = await Helper.checkToken({ duration: process.env.TOKEN_TIME!, tokenTime: token.createdAt });
      if (!checkToken) {
         this.deleteOTP(params);
         return { success: false, status: 403, message: `Invalid or expired token`, data: params};
      }
      return { success: true, status: 200, message: 'OTP verified successfully', data: params};
   }
   
   async deleteOTP (params: IOtpParams) {
      await this.client.del(params.user.email);
      return { success: true, status: 200, message: 'OTP deleted successfully', data: params};
   }
}
