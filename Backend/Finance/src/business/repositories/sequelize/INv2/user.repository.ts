/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
import { Op, User, } from "../../../../domain/sequelize/INv2";
import {  getDbCxn } from "../../../../domain";
import { injectable } from "inversify";
import { Repository } from "sequelize-typescript";
import { Exception, UserDto, CreateUserDto, IQueryOptions } from "@inv2/common";
import { Transaction } from "sequelize";
import { IUserRepository } from "../../IUserRepository";

@injectable()
export class UserRepository implements IUserRepository {
   get userRepo(): Repository<User> {return getDbCxn()?.getRepository(User);}
   // create<T>(createUserDto: CreateUserDto): Promise<T> {
   //    console.log(createUserDto);
      
   //    throw new Error("Method not implemented.");
   // }
   public async transaction(): Promise<Transaction> {
      return await  getDbCxn()?.transaction();
   }
   public async commit(t: Transaction): Promise<void> {
      await t.commit();
   }
   public async rollback(t: Transaction): Promise<void> {
      await t.rollback();
   }
   public async findOne<T>(where: any, attributes: string[], includes?: any[]): Promise<T | null> {
      const user = await this.userRepo.findOne({
         ...(attributes?.length > 0 && { attributes }),
         where,
         include: includes || [],
      });
      return user as T | null;
   }

   public async findByEmail<UserTenantRoleDto>(email: string, attributes: string[], tenantId: string, options: IQueryOptions): Promise<UserTenantRoleDto> {

      const t = options.transaction ?? await this.transaction();
      const user = await this.userRepo.findOne({
         attributes,
         where: { email:{[Op[User.sequelize?.getDialect()==='postgres'?'iLike':'like']]: email}, },
         transaction: t,
      });
      if(!options.transaction) await this.commit(t);
      if(!user) return {} as UserTenantRoleDto;
      return user as UserTenantRoleDto;      
   }
   public async update<User>(id: string, attributes?: Partial<UserDto>, options?: IQueryOptions): Promise<User | null> {
      const t: Transaction = options?.transaction ?? await this.transaction();
      
      const user = await this.userRepo.findByPk(id); 
      if(!user) throw new Exception({code: 404, message: `Couldn't find user`});
      // await this.repo.update({...attributes}, {where: {id}, transaction: t});
      await user.update({...attributes}, {transaction: t});

      if(!options?.transaction) await this.commit(t);
      return user as User;
   }
   public async create<User>(createUserDto: CreateUserDto, options?: IQueryOptions): Promise<User> {
      const t: Transaction = options?.transaction ?? await this.transaction();
      const user = this.userRepo.create({
         id: createUserDto.user.id,
         pId: createUserDto.user.pId,
         details: createUserDto,
         tenantRoles: createUserDto.tenant,
      }, {transaction: t});

      if(!options?.transaction) await this.commit(t);
      return user as User;
   }
   
}