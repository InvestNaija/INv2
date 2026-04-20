import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { UserDto, UserTenantRoleDto, IResponse, JWTService, Exception, OtpService, DBEnums, Helper } from "@inv2/common";
import { redisWrapper } from '../../redis.wrapper';
import { User } from "../../domain/sequelize/INv2";
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

      const user = await this.userSvc.createUser({ user: body, tenant: tenants[0], role: roles[0] }, undefined, true);

      return user;
   }
   async registerDependent(body: Partial<UserDto>, guardianId: string): Promise<IResponse> {
      const {data: roles} = await this.roleSvc.getRoles({roleName: 'CUSTOMER'});
      const {data: tenants} = await this.tenantSvc.getTenants({code: 'CHDS'});
      body.userType = DBEnums.UserType?.find(g=>(g.label?.toLowerCase()=='minor'))?.code;

      const dependent = await this.userSvc.createUser({ user: body, tenant: tenants[0], role: roles[0] }, guardianId, false);
      return dependent;
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
   async forgotPassword (email: string): Promise<IResponse> {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Exception({ code: 404, message: `User not found` });

      const otpSvc = new OtpService(redisWrapper.client as any);
      const otpResp = await otpSvc.generateOTP({
         user: { id: user.id, email: user.email, name: user.firstName },
         subject: 'Forgot Password OTP',
      });

      if (!otpResp.success) throw new Exception({ code: 500, message: `Failed to generate OTP` });

      return { success: true, code: 200, message: `OTP sent successfully to your email` };
   }

   async resetPassword (body: { email: string, otp: string, password: string, confirmPassword: string }): Promise<IResponse> {
      const user = await User.findOne({ attributes: ['id', 'email', 'firstName', 'lastName'],  where: { email: body.email } });
      if (!user) throw new Exception({ code: 404, message: `User not found` });

      const otpSvc = new OtpService(redisWrapper.client as any);
      const verifyResp = await otpSvc.verifyOTP({
         user: { id: user.id, email: user.email, name: user.firstName },
         token: body.otp
      } as any);

      if (!verifyResp.success) {
         throw new Exception({ code: 403, message: verifyResp.message || `Invalid or expired OTP` });
      }

      const resetResp = await this.userSvc.resetPassword(body.email, { password: body.password, confirmPassword: body.confirmPassword });
      
      return resetResp;
   }

   async changePassword (userId: string, body: { oldPassword: string, newPassword: string }): Promise<IResponse> {
      return await this.userSvc.changePassword(userId, body);
   }

}