// import { Request, Response, NextFunction } from "express";
// import { UnauthorizedError } from "@inv2/common";

// export const authorize =  (roles:string[] = []) =>{
//    if(!Array.isArray(roles) || roles.length <= 0) throw new UnauthorizedError();
//    if(roles.length === 1 && roles.includes('*')){
//       roles = ['TENANT_ADMIN', 'SUPER_ADMIN', 'USER', 'CUSTOMER'];
//    }
//    return async (req: Request, res: Response, next: NextFunction) => {
//       try {
//          let { userId, tenantId, role } = res.locals.user
//          let userAndTenant = await (new AuthService).getUserAndTenant({ userId, tenantId })
//          if (!userAndTenant || !userAndTenant.success) 
//             throw new AppError(
//                   userAndTenant.show?userAndTenant.message:'Wrong email or password', 
//                   userAndTenant.line||__line, userAndTenant.file||__path.basename(__filename), 
//                   { status: userAndTenant.status||404, show: userAndTenant.show||true }
//             );
//          let user = UserService.reformat(userAndTenant.user);
//          if(role) {
//             if(!roles.includes(role))throw new AppError(`Permission not granted for role(s)`, __line, __path.basename(__filename), { status: 401, show: true });
//             next();
//          } else {
//             if (!user.dataValues.Tenant[0].dataValues.Roles.some(e => roles.includes(e.name))) 
//                throw new AppError(`Permission not granted for role(s)`, __line, __path.basename(__filename), { status: 401, show: true });
//             else{ 
//                if(!res.locals.user?.role)
//                   res.locals.user = {...res.locals.user, role: user.dataValues.Tenant[0].dataValues.Roles[0].dataValues.name};
//                next();
//             }
//          }
//       } catch (error) {
//          console.log(error.message);
//          return next(
//             new AppError(
//                   error.message
//                   , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
//          );
//       }
//    }
// }