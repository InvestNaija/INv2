import { inject, injectable } from "inversify";
import { CreateUserDto, UserTenantRoleDto, CustomError, Exception, IResponse, UserDto, Helper, OtpService, handleError, } from "@inv2/common";
import { User, TenantUserRole, Op, Tenant,  } from "../../domain/sequelize/INv2";
import { Transaction, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { UserCreatedPublisher, UserUpdatedPublisher } from "../../events/publishers";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
import { redisWrapper } from '../../redis.wrapper';
import { TYPES } from "../types";
import { IUserRepository } from "../repositories";
import { PasswordManager } from "../../_utils/PasswordManager";

@injectable()
export class UserService {
   constructor(
      @inject(TYPES.IUserRepository) 
      private readonly userRepo: IUserRepository,
   ){}
   
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
            tur.user.refCode = refCode.replace(/[^a-zA-Z]/g, '').toUpperCase() + Helper.genRandomCode(2, { includeSpecialChars: false });
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
         new UserCreatedPublisher(rabbitmqWrapper.connection).publish({
            tenant: tur.tenant,
            user: (createdUser.toJSON() as UserDto),
            role: tur.role
         });         
         const otpResp = await (new OtpService(redisWrapper.client)).generateOTP({user: {id: createdUser.id, email: createdUser.email, name: createdUser.firstName}});
         if(!otpResp || !otpResp.success) throw new Exception({ code: 400, message: `Error occured while processing request` });
         
         // await new EmailBuilderService({ recipient: user.email, sender: sender??'info@investnaija.com', subject: (subject??'One Time Password')+` <${otp}>` })
         //    .setCustomerDetails(user)
         //    .setEmailType({ type: 'resend_otp', meta: { user, otp, message } })
         //    .execute();
         if(!transaction) await t.commit();         
         return { success: true, code: 201, message: `User created successfully`, data: createdUser, extra: {otp: otpResp.message} };
      } catch (error) {
         const err = (error as Error);
         if(!transaction) await t.rollback();
         if(error instanceof CustomError) throw new Exception(error);
         else if(error instanceof (ValidationError||SequelizeScopeError||DatabaseError)) throw new Exception({code: 500, message: error.errors[0].message});
         else return new Exception({code: 500, message: err!.message, success: false});
      }
   }
   async signin (body: Partial<UserDto>, tenant?: Partial<Tenant>): Promise<IResponse> {
      const t = await this.userRepo.transaction();
      try {
         const userTenantRoleDto = await this.userRepo.findByEmail<UserTenantRoleDto>(
            body.email!,
            ["id","bvn","firstName","lastName","firstLogin", "email", "password", "uuidToken", "isEnabled", "isLocked"],
            tenant?.id,
            { transaction: t },
         );
         if (!userTenantRoleDto || !userTenantRoleDto.user) throw new Exception({code: 401, message: 'Wrong email or password'});
         if(!userTenantRoleDto.user.password) throw new Exception({code: 401, message: 'Your account password was not properly set. Please check or contact admin'});
         if(!await PasswordManager.compare(userTenantRoleDto.user.password!, body.password!)) throw new Exception({code: 401, message: 'Wrong email or password'});
         if (!userTenantRoleDto.user.isEnabled && userTenantRoleDto.user.isLocked) 
            throw new Exception({code: 423, message: 'Account inactive and locked. Please activate to continue'});
         
         // delete userTenantRoleDto.user.email;
         delete userTenantRoleDto.user.password;
   
         await this.userRepo.update(userTenantRoleDto!.user!.id!, {
            uuidToken: Helper.genRandomCode(32, { includeSpecialChars: true }),
            firstLogin: false,
            version: +userTenantRoleDto.user.version! + 1
         },{ transaction: t },);
         await new UserUpdatedPublisher(rabbitmqWrapper.connection).publish(userTenantRoleDto!);
         
         await this.userRepo.commit(t);
         return { success: true, code: 200, message: `User login successful`, data: userTenantRoleDto };
      } catch (error: unknown|Error) {
         await this.userRepo.rollback(t);
         return handleError(error);
      }
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
}