import {Request, Response, NextFunction }  from 'express';
import jwt from 'jsonwebtoken';
import { UserTenantRoleDto } from '../_dtos';


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
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as UserTenantRoleDto;
      
      req.currentUser = payload
   } catch (error) {
   }
   next();
}