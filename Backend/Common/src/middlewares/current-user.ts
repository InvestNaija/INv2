import {Request, Response, NextFunction }  from 'express';
import { UserTenantRoleDto } from '../_dtos';
import { JWTService } from '../services';
import { Exception } from '../errors';


declare global {
   namespace Express {
      interface Request {
         currentUser?: UserTenantRoleDto
      }
   }
}
export const currentUser = (req: Request, res: Response, next: NextFunction) => {
   if(!req.headers['authorization']) {
      return next();
   }
   
   try {
      let token = req.headers['authorization'];
      if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
         token = token.slice(7, token.length);
      }
      const jwtToken = JWTService.verifyJWTToken(token, process.env.ACCESS_TOKEN_SECRET!);
      if(!jwtToken || !jwtToken.success) throw new Exception(jwtToken);

      const payload = jwtToken.data as UserTenantRoleDto;
      req.currentUser = payload
   } catch (error) { }
   next();
}