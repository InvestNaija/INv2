import { UserDto, UserTenantRoleDto, IResponse, JWTService, Exception } from "@inv2/common";
import { RoleService, TenantService, UserService } from ".";
import { Tenant, } from "../../database/sequelize/INv2";

export class AuthService {
   async signup (body: Partial<UserDto>): Promise<IResponse> {
      const roleService = new RoleService;
      const {data: roles} = await roleService.getRoles({roleName: 'CUSTOMER'});
      const tenantService = new TenantService;
      const {data: tenants} = await tenantService.getTenants({code: 'CHDS'});

      const userService = new UserService;
      const user = await userService.createUser({ user: body, tenant: tenants[0], role: roles[0] });

      return user;
   }
   async signin (body: Partial<UserDto>, tenant?: Partial<Tenant>): Promise<IResponse> {
      const userService = new UserService;
      const {data: signin} = await userService.signin(body, tenant);

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
      const userService = new UserService;
      const set2FA = await userService.set2FA(currentUser, body);

      return set2FA;
   }
}