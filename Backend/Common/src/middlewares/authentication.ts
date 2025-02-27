import {Request, Response, NextFunction }  from 'express';
import { UnauthorizedError } from "../errors/unauthorized-error";
import { RoleDto, UserTenantRoleDto } from '../_dtos';
import { JWTService } from '../services';
import { Exception } from '../errors';


declare global {
   namespace Express {
      interface Request {
         currentUser?: UserTenantRoleDto
      }
   }
}
export class Authentication {
   static currentUser = (req: Request, res: Response, next: NextFunction) => {
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
   static requireAuth = (req: Request, res: Response, next: NextFunction) => {
      if(!req.currentUser){
         throw new UnauthorizedError();
      }
      next()
   }
   static authorize(roles:string[] = []) {
      if(!Array.isArray(roles) || roles.length <= 0) throw new UnauthorizedError();
      if(roles.length === 1 && roles.includes('*')){
         roles = ['TENANT_ADMIN', 'SUPER_ADMIN', 'USER', 'CUSTOMER'];
      }
      return async (req: Request, res: Response, next: NextFunction) => {
         const userTenantRole = req?.currentUser as UserTenantRoleDto;
         if(!userTenantRole || !userTenantRole.Tenant[0]) throw new UnauthorizedError();
         const tenant = userTenantRole.Tenant[0];
         
         
         // const roles = tenant.Roles as RoleDto[];
         let allowed = false;
         for(const role of (tenant.Roles as RoleDto[])) {
            if(roles.includes(role.name )) allowed = true;
         }
         if(allowed) return next();
         // if(!roles.includes(userTenantRole!.Tenant![0]?.Role![0] || '')) throw new UnauthorizedError();
         throw new UnauthorizedError();
      };
   }
}