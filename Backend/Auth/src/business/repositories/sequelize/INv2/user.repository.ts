/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
import { Op, User, TenantUserRole, Tenant, Role } from "../../../../domain/sequelize/INv2";
import { IUserRepository } from "../../../../business/repositories/IUserRepository";
import datasource from "../../../../domain";
import { injectable } from "inversify";
import { Repository } from "sequelize-typescript";
import { Exception, UserDto, UserTenantRoleDto } from "@inv2/common";
import { Transaction } from "sequelize";
import { IQueryOptions } from "../../../../../../Common/src/database/IGenericRepository";

@injectable()
export class UserRepository implements IUserRepository {
   private repo: Repository<User>;
   constructor() {
      this.repo = datasource.pgINv2?.getRepository(User);
   }
   public async transaction(): Promise<Transaction> {
      return await  datasource.pgINv2?.transaction();
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
         include: [
            {
               model: TenantUserRole, where: { ...(tenantId && { tenantId})}, required: false,
               include: [
                  { model: Tenant, attributes: ["id", "name"], },
                  { model: Role, attributes: ["name"], },
               ]
            }
         ],      
         where: { email:{[Op[User.sequelize?.getDialect()==='postgres'?'iLike':'like']]: email}, },
         transaction: t,
      });
      if(!options.transaction) await this.commit(t);
      if(!user) return {} as UserTenantRoleDto;
      return this.reformat(user) as UserTenantRoleDto;      
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
   
   reformat (user: User) : UserTenantRoleDto  {
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
      // user.dataValues.Tenant = tenants;
      return {user: user.dataValues, Tenant: tenants};
   }
}