import { CreateUserDto, UserTenantRoleDto, CustomError, Exception, IResponse, UserDto, Helper, OtpService} from "@inv2/common";
import { User, TenantUserRole, Op, Tenant, Role, } from "../../database/sequelize/INv2";
import { Transaction, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { UserCreatedPublisher, UserUpdatedPublisher } from "../../events/publishers";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
import { redisWrapper } from '../../redis.wrapper';

export class UserService {
   async createUser(tur: CreateUserDto, sendOtp?: boolean, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await User.sequelize?.transaction()) as Transaction;    
      try {
         
         const emailExists = await User.findOne({
            attributes: ['id', 'email', 'bvn'],
            where: { [Op.or]: {
               email: {[Op[User.sequelize?.getDialect()==='postgres'?'iLike':'like']]: tur.user.email}, ...(tur.user.bvn && {bvn: String(tur.user.bvn)})
            } },
         });
         if (emailExists) throw new Exception({ code: 400, message: `Email/BVN already registered` });

         tur.user.isEnabled = false;
         tur.user.isLocked = true;
         // Generate refCode for user
         const refCode = (tur.user?.firstName?.charAt(0)??'') + (tur.user?.lastName?.charAt(0)??'');
         let refCodeExists = 0;
         tur.user.refCode = '';
         do {
            tur.user.refCode = refCode.replace(/[^a-zA-Z]/g, '').toUpperCase() + Helper.generatePassword(2, { includeSpecialChars: false });
            refCodeExists = await User.count({ where: { refCode: `${tur.user.refCode}` }, });
         } while (refCodeExists > 0);
         
         // Create user in users table
         const createdUser = await User.create(tur.user, {
            attributes: ['id', 'firstName', 'middleName', 'lastName', 'email'],
            transaction: t, returning: true,
         });
         await TenantUserRole.create({
            tenantId: tur.tenant.id,
            userId: createdUser.id,
            roleId: tur.role.id
         },{ transaction: t });
         delete createdUser.dataValues.password;
         // Publish the newly created user to the queue
         await new UserCreatedPublisher(rabbitmqWrapper.connection).publish({
            tenant: tur.tenant,
            user: (createdUser.toJSON() as UserDto),
            role: tur.role
         });

         const otpResp = await (new OtpService(redisWrapper.client)).generateOTP({user: {id: createdUser.id, email: createdUser.email, name: createdUser.firstName}});
         if(!otpResp || !otpResp.success) throw new Exception({ code: 400, message: `Error occured while processing request` });

         if(!transaction) await t.commit();
         return { success: true, code: 201, message: `User created successfully`, data: createdUser };
      } catch (error) {
         const err = (error as Error);
         if(!transaction) await t.rollback();
         if(error instanceof CustomError) throw new Exception(error);
         else if(error instanceof (ValidationError||SequelizeScopeError||DatabaseError)) throw new Exception({code: 500, message: error.errors[0].message});
         else return new Exception({code: 500, message: err!.message, success: false});
      }
   }
   async signin (body: Partial<UserDto>, tenant?: Partial<Tenant>): Promise<IResponse> {
      const chkUsr = await this.loginByEmail(body, tenant);
      const user  = UserService.reformat(chkUsr.data);
      
      return { success: true, code: 200, message: `User created successfully`, data: user };
   }
   async set2FA (currentUser: UserTenantRoleDto, body: {enable2fa: boolean}): Promise<IResponse> {
      const user = await User.findOne({
         attributes: ["id","twoFactorAuth"],
         where:  {id: currentUser.user.id},
      });
      if (!user) throw new Exception({code: 404, message: 'Wrong email or password'});
      if (!user.isEnabled && user.isLocked) throw new Exception({code: 423, message: 'Account inactive and locked. Please activate to continue'});
      await user.update({
         twoFactorAuth: body.enable2fa
      }, {where: {id: currentUser.user.id}});
      
      await new UserUpdatedPublisher(rabbitmqWrapper.connection).publish({
         user: (user.toJSON() as UserDto),
      });
      return { success: true, code: 200, message: `2FA ${body.enable2fa ? 'enabled' : 'disabled'}` };
   }
   async loginByEmail (body: Partial<UserDto>, tenant?: Partial<Tenant>) {
      const user = await User.findOne({
         attributes: ["id","bvn","firstName","lastName","firstLogin", "email","password", "uuidToken", "isEnabled", "isLocked"],
         where: { email: {[Op.iLike]: body.email}, },
         include: [
            {
               model: TenantUserRole, where: { ...(tenant?.id && { tenantId: tenant.id })}, required: false,
               include: [
                  { model: Tenant, attributes: ["id", "name"], },
                  { model: Role, attributes: ["name"], },
               ]
            }
         ],
      });
      if (!user) throw new Exception({code: 404, message: 'Wrong email or password'});
      if (!user.isEnabled && user.isLocked) throw new Exception({code: 423, message: 'Account inactive and locked. Please activate to continue'});
      // if (!user.isEnabled) throw new AppError('Account not active. Please activate to continue', __line, __path.basename(__filename), { status: 404, show: true });
      await user.update({
         uuidToken: Helper.generateOTCode(32, true),
         firstLogin: false,
         version: +user.version + 1
      });
      await new UserUpdatedPublisher(rabbitmqWrapper.connection).publish({
         user: (user.toJSON() as UserDto),
      });
      return { success: true, code: 200, message: `User login successful`, data: user };
   }
   static reformat (user: User)  {
      const tenants: Tenant[] = [];
      user.tenantUserRoles.forEach((item)=> {
         const index = tenants.findIndex(t=>(t.id===item.tenant.id));
         if (index < 0) {
            item.tenant.dataValues.Roles = [item.role];
            tenants.push(item.tenant);
         } else {
            tenants[index].dataValues.Roles.push(item.role);
         }
      });
      
      delete user.dataValues.tenantUserRoles;
      delete user.dataValues.password;
      delete user.dataValues.email;
      // user.dataValues.Tenant = tenants;
      return {user: user.dataValues, Tenant: tenants};
   }
}