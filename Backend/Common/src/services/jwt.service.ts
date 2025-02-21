import jwt from 'jsonwebtoken';
import { Exception, IResponse } from '../errors/custom-error';

export class JWTService {
   static createJWTToken(value: any, secret?: string, time?: string): IResponse {
      try {
         const token = jwt.sign(value, secret||process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: time||"1h"
         })
  
         return { code: 200, success: true, message: `Token generated successfully`, data: token };
      } catch (error) {
         const err = (error as Error);
         throw new Exception({code: 500, message: err.message})
      }
   }
   static verifyJWTToken (token: string, secret: string): IResponse {
      try {
         const data = jwt.verify(token, secret||process.env.ACCESS_TOKEN_SECRET!);
         return { code: 200, success: true, message: `Token decoded successfully`, data };
      } catch (error) {
         const err = (error as Error);
         throw new Exception({code: 500, message: err.message})
      }
   }
}