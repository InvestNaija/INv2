/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
import { Op, User, } from "../../../../domain/sequelize/INv2";
import { IUserRepository } from "../../../../business/repositories/IUserRepository";
import {  getDbCxn } from "../../../../domain";
import { injectable } from "inversify";
import { Repository } from "sequelize-typescript";
import { Exception, UserDto, CreateUserDto } from "@inv2/common";
import { Transaction } from "sequelize";
import { IQueryOptions } from "../../../../../../Common/src/database/IGenericRepository";

@injectable()
export class UserRepository implements IUserRepository {
   private repo: Repository<User>;
   constructor() {
      this.repo = getDbCxn().pgINv2?.getRepository(User);
   }
   create<T>(createUserDto: CreateUserDto): Promise<T> {
      console.log(createUserDto);
      
      throw new Error("Method not implemented.");
   }
   public async transaction(): Promise<Transaction> {
      return await  getDbCxn().pgINv2?.transaction();
   }
   public async commit(t: Transaction): Promise<void> {
      await t.commit();
   }
   public async rollback(t: Transaction): Promise<void> {
      await t.rollback();
   }
   public async findOne<T>(attributes: string[], where: any, includes?: any[]): Promise<T | null> {
      const user = await this.repo.findOne({
         attributes,
         where,
         include: includes || [],
      });
      return user as T | null;
   }

   public async findByEmail<UserTenantRoleDto>(email: string, attributes: string[], tenantId: string, options: IQueryOptions): Promise<UserTenantRoleDto> {

      const t = options.transaction ?? await this.transaction();
      const user = await this.repo.findOne({
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
      
      const user = await this.repo.findByPk(id);
      if(!user) throw new Exception({code: 404, message: `Couldn't find user`});
      // await this.repo.update({...attributes}, {where: {id}, transaction: t});
      await user.update({...attributes}, {transaction: t});

      if(!options?.transaction) await this.commit(t);
      return user as User;
   }
   // public async create<User>(createUserDto: CreateUserDto): Promise<User> {
   //    const user = this.repo.create(createUserDto);
   //    await this.repo.save(user);
   //    return user as User;
   // }
   
}