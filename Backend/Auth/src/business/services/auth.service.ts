import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { UserDto, UserTenantRoleDto, IResponse, JWTService, Exception } from "@inv2/common";
import { RoleService, TenantService, UserService } from ".";
import { Tenant, } from "../../domain/sequelize/INv2";
// import { UserService } from "./user.service";
// import { RoleService } from "./role.service";
// import { TenantService } from "./tenant.service";

@injectable()
export class AuthService {
   constructor(
      @inject(TYPES.UserService) 
      private readonly userSvc: UserService,
      @inject(TYPES.RoleService) 
      private readonly roleSvc: RoleService,
      @inject(TYPES.TenantService)
      private readonly tenantSvc: TenantService,
   ){}
   async signup (body: Partial<UserDto>): Promise<IResponse> {
      const {data: roles} = await this.roleSvc.getRoles({roleName: 'CUSTOMER'});
      const {data: tenants} = await this.tenantSvc.getTenants({code: 'CHDS'});

      const user = await this.userSvc.createUser({ user: body, tenant: tenants[0], role: roles[0] });

      return user;
   }
   async signin (body: Partial<UserDto>, tenant?: Partial<Tenant>): Promise<IResponse> {
      const {data: signin} = await this.userSvc.signin(body, tenant);

      let response = {code: 200, message: `User login successful`, extra: {}, data: {}};
      if (signin.Tenant.length > 1) {
         signin.Tenant.forEach((tenant: Tenant) => {
            delete tenant.dataValues.Roles;
         });
         response = {...response, extra: { multiTenant: true}, data: signin };
      } else {
         const token = JWTService.createJWTToken(JSON.parse(JSON.stringify(signin)), process.env.ACCESS_TOKEN_SECRET!, process.env.ACCESS_TOKEN_TIME!);
         if (!token.success) 
            throw new Exception({code: token.code||500, message: token.message||`Error creating access token`});

         response = {...response, extra: { multiTenant: false, token: token.data}, data: signin };
      }
      return response;
   }
   async set2FA (currentUser: UserTenantRoleDto, body: {enable2fa: boolean}): Promise<IResponse> {
      const set2FA = await this.userSvc.set2FA(currentUser, body);

      return set2FA;
   }
}