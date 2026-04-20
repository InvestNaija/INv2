import { inject, injectable } from "inversify";
import { CreateUserDto, UserTenantRoleDto, CustomError, Exception, IResponse, UserDto, Helper, OtpService, handleError, RSAEncryption, DBEnums, } from "@inv2/common";
import { User, TenantUserRole, Op, Tenant,  } from "../../domain/sequelize/INv2";
import { Transaction, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { UserCreatedPublisher, UserUpdatedPublisher } from "../../events/publishers";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
import { redisWrapper } from '../../redis.wrapper';
import { TYPES } from "../types";
import { IUserRepository } from "../repositories";
import { PasswordManager } from "../../_utils/PasswordManager";

import { PasswordHistoryService } from "./password-history.service";

@injectable()
export class UserService {
   constructor(
      @inject(TYPES.IUserRepository) 
      private readonly userRepo: IUserRepository,
      @inject(TYPES.PasswordHistoryService)
      private readonly historySvc: PasswordHistoryService,
   ){}
   
   async createUser(tur: CreateUserDto, guardianId?: string, sendOtp: boolean=true, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await User.sequelize?.transaction()) as Transaction;    
      try {
         const where: any = { [Op.or]: [] };
         if (tur.user.email) where[Op.or].push({ email: { [Op[User.sequelize?.getDialect() === 'postgres' ? 'iLike' : 'like']]: tur.user.email } });
         if (tur.user.phone) where[Op.or].push({ phone: tur.user.phone });
         if (tur.user.bvn) where[Op.or].push({ bvn: String(tur.user.bvn) });
         if (tur.user.nin) where[Op.or].push({ nin: String(tur.user.nin) });

         if (where[Op.or].length > 0) {
            const userExists = await User.findOne({
               attributes: ['id', 'email', 'bvn', 'phone', 'nin'],
               where: where,
            });
            if (userExists) {
               let field = 'Email/BVN/NIN';
               if (userExists.email === tur.user.email) field = 'Email';
               else if (userExists.phone === tur.user.phone) field = 'Phone';
               else if (userExists.bvn === tur.user.bvn) field = 'BVN';
               else if (userExists.nin === tur.user.nin) field = 'NIN';
               throw new Exception({ code: 400, message: `${field} already registered` });
            }
         }
         tur.user.isEnabled = false;
         tur.user.isLocked = true;

         // If this is a dependant account, set the parent ID and enable the account
         if ( DBEnums.UserType?.find(g=>(g.code === tur.user.userType))?.name?.toLowerCase() == 'minor' ) {
            tur.user.pId = guardianId;
            tur.user.isEnabled = true;
            tur.user.isLocked = false;
         }
         if (tur.user.password) {
            tur.user.password = new RSAEncryption({privateKey: process.env.RSA_GENERAL_PRIVATE_KEY!}).decrypt(tur.user.password!);
         } else {
            tur.user.password = Helper.genRandomCode(12, { includeSpecialChars: true });
         }

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
            attributes: ['id', 'firstName', 'middleName', 'lastName', 'email', 'pId', 'userType'],
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
         } as any);

         let otpResp: any;
         if (sendOtp) {
            otpResp = await (new OtpService(redisWrapper.client as any)).generateOTP({user: {id: createdUser.id, email: createdUser.email, name: createdUser.firstName}});
            if(!otpResp || !otpResp.success) throw new Exception({ code: 400, message: `Error occured while processing request` });
         }
         
         if(!transaction) await t.commit();         
         return { success: true, code: 201, message: `User created successfully`, data: createdUser, extra: {...(otpResp?.message && {otp: otpResp.message})} };
      } catch (error) {
         const err = (error as Error);
         if(!transaction) await t.rollback();
         if(error instanceof CustomError) throw new Exception(error);
         else if(error instanceof (ValidationError||SequelizeScopeError||DatabaseError)) throw new Exception({code: 500, message: (error as any).errors?.[0]?.message || err.message});
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

         if (!userTenantRoleDto.user.isEnabled && userTenantRoleDto.user.isLocked) 
            throw new Exception({code: 423, message: 'Account inactive and locked. Please activate to continue'});
         
         // delete userTenantRoleDto.user.email;
         delete userTenantRoleDto.user.password;
   
         await this.userRepo.update(userTenantRoleDto!.user!.id!, {
            uuidToken: Helper.genRandomCode(32, { includeSpecialChars: true }),
            firstLogin: false,
            version: +userTenantRoleDto.user.version! + 1
         } as any,{ transaction: t },);
         await new UserUpdatedPublisher(rabbitmqWrapper.connection).publish(userTenantRoleDto!);
         
         await this.userRepo.commit(t);
         return { success: true, code: 200, message: `User login successful`, data: userTenantRoleDto };
      } catch (error) {
         const err = (error as Error);
         await t.rollback();
         if(error instanceof CustomError) throw new Exception(error);
         else if(error instanceof (ValidationError||SequelizeScopeError||DatabaseError)) throw new Exception({code: 500, message: error.errors[0].message});
         else return new Exception({code: 500, message: err!.message, success: false});
      }
   }
   async set2FA (currentUser: UserTenantRoleDto, body: {enable2fa: boolean}): Promise<IResponse> {
      const user = await User.findOne({
         attributes: ["id","twoFactorAuth","isEnabled","isLocked"],
         where:  {id: currentUser.user.id},
      });
      if (!user) throw new Exception({code: 404, message: 'User not found'});
      if (!user.isEnabled && user.isLocked) throw new Exception({code: 423, message: 'Account inactive and locked. Please activate to continue'});
      await user.update({
         twoFactorAuth: body.enable2fa
      }, {where: {id: currentUser.user.id}});
      
      await new UserUpdatedPublisher(rabbitmqWrapper.connection).publish({
         user: (user.toJSON() as UserDto),
      });
      return { success: true, code: 200, message: `2FA ${body.enable2fa ? 'enabled' : 'disabled'}` };
   }

   async changePassword(userId: string, body: { oldPassword: string, newPassword: string }): Promise<IResponse> {
      const t = await this.userRepo.transaction();
      try {
         const user = await User.findByPk(userId);
         if (!user) throw new Exception({ code: 404, message: `User not found` });

         // Decrypt passwords (they are sent RSA encrypted)
         const rsa = new RSAEncryption({ privateKey: process.env.RSA_GENERAL_PRIVATE_KEY! });
         const oldPassword = rsa.decrypt(body.oldPassword);
         const newPassword = rsa.decrypt(body.newPassword);

         // Validate old password
         if (!(await PasswordManager.compare(user.password, oldPassword))) {
            throw new Exception({ code: 400, message: `Incorrect old password` });
         }

         // Check password history
         const isReused = await this.historySvc.isPasswordReused(userId, newPassword, user.password);
         if (isReused) {
            throw new Exception({ code: 400, message: `You cannot reuse any of your last ${process.env.PASSWORD_HISTORY_DEPTH || 5} passwords.` });
         }

         // Record current password to history BEFORE updating
         await this.historySvc.recordPassword(userId, user.password, t);

         // Update password
         await user.update({ password: newPassword }, { transaction: t });

         await this.userRepo.commit(t);
         return { success: true, code: 200, message: `Password changed successfully` };
      } catch (error) {
         await t.rollback();
         if (error instanceof CustomError) throw new Exception(error);
         throw new Exception({ code: 500, message: `Internal server error` });
      }
   }

   async resetPassword(email: string, body: { password: string, confirmPassword: string }): Promise<IResponse> {
      const t = await this.userRepo.transaction();
      try {
         const user = await User.findOne({ where: { email } });
         if (!user) throw new Exception({ code: 404, message: `User not found` });

         const rsa = new RSAEncryption({ privateKey: process.env.RSA_GENERAL_PRIVATE_KEY! });
         const password = rsa.decrypt(body.password);
         const confirmPassword = rsa.decrypt(body.confirmPassword);
         if(password !== confirmPassword) throw new Exception({ code: 400, message: `Passwords do not match` });

         // Check password history
         const isReused = await this.historySvc.isPasswordReused(user.id, password, user.password);
         if (isReused) {
            throw new Exception({ code: 400, message: `You cannot reuse any of your last ${process.env.PASSWORD_HISTORY_DEPTH || 5} passwords.` });
         }

         // Record current password to history
         await this.historySvc.recordPassword(user.id, user.password, t);

         // Update password
         await user.update({ password: password }, { transaction: t });

         await this.userRepo.commit(t);
         return { success: true, code: 200, message: `Password reset successfully` };
      } catch (error) {
         await t.rollback();
         if (error instanceof CustomError) throw new Exception(error);
         throw new Exception({ code: 500, message: `Internal server error` });
      }
   }
}