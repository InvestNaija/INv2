/* eslint-disable @typescript-eslint/no-explicit-any */

import { User} from "../../../../domain/typeorm/INv2";
import { injectable } from "inversify";
import { IUserRepository } from "../../IUserRepository";
import { getDbCxn } from "../../../../domain";
import { Like, QueryRunner, Repository,  } from "typeorm";
import { IQueryOptions } from "../../../../../../Common/src/database/IGenericRepository";
import { UserDto, } from "@inv2/common";

@injectable()
export class UserRepository implements IUserRepository {
   get userRepo(): Repository<User> {return getDbCxn('toINv2').getRepository(User);}

   async transaction(): Promise<QueryRunner> {
      const queryRunner = getDbCxn('toINv2')?.createQueryRunner();
      if (!queryRunner) {
         throw new Error("Failed to create query runner");
      }
      await queryRunner.startTransaction();
      return queryRunner;
   }

   async commit(queryRunner: QueryRunner): Promise<void> {
      if (queryRunner) {
         await queryRunner.commitTransaction();
         await queryRunner.release();
      } else {
         throw new Error("No active transaction to commit");
      }
   }

   async rollback(queryRunner: QueryRunner): Promise<void> {
      if (queryRunner) {
         await queryRunner.rollbackTransaction();
         await queryRunner.release();
      } else {
         throw new Error("No active transaction to rollback");
      }
   }
   async findByEmail<T>(email: string, attributes: string[], tenantId?: string, options?: IQueryOptions): Promise<T> {
      const t = options?.transaction ?? await this.transaction();
      // const tur =  this.userRepo.createQueryBuilder('user')
      //    .select(attributes.map(attr => `user.${attr}`))
      //    .leftJoin('user.tenantUserRoles', 'tur').addSelect(["tur.tenant"])
      //    .innerJoin('tur.tenant', 'tenants').addSelect(["tenants.id", "tenants.name"])
      //    .innerJoin('tur.role', 'roles').addSelect(["roles.name"])
      //    .where(`user.email ILIKE :email`, { email });
      // if (tenantId) tur.andWhere(`tur.tenant = :tenantId`, { tenantId });
      // const user = await tur.getOne();
      const user = await this.userRepo.findOne({
         relations: ["tenantUserRoles", "tenantUserRoles.tenant", "tenantUserRoles.role"],
         // select: {
         //    tenantUserRoles: {
         //       tenant: { id: true, name: true },
         //       role: { name: true },
         //    },
         //    ...attributes.reduce((acc, attr) => ({ ...acc, [attr]: true }), {}),
         // },
         where: [{email: Like(`%${email}%`) }],
      });
      if(!options?.transaction) await this.commit(t);
      if(!user) return {} as T;
      // const roles = tur.tenantUserRoles;
      // return this.reformat(user) as T;  
      return user as T;
   }

   async findOne<T>(attributes: string[], where: any, includes?: any[]): Promise<T | null> {
      const queryBuilder = this.userRepo.createQueryBuilder("user");

      if (attributes && attributes.length > 0) {
         queryBuilder.select(attributes.map(attr => `user.${attr}`));
      }

      Object.keys(where).forEach((key, index) => {
         queryBuilder.andWhere(`user.${key} = :value${index}`, { [`value${index}`]: where[key] });
      });

      if (includes && includes.length > 0) {
         includes.forEach(include => {
            queryBuilder.leftJoinAndSelect(`user.${include}`, include);
         });
      }

      const user = await queryBuilder.getOne();
      return user as T | null;
   }
   async update<User>(id: string, attributes?: Partial<UserDto>, options?: Partial<IQueryOptions>): Promise<User | null> {
      const t: QueryRunner = options?.transaction ?? await this.transaction();
      await this.userRepo.update(id, attributes || {});
      const updatedUser = await this.userRepo.findOne({where:{id}});
      if(!options?.transaction) await this.commit(t);
      return updatedUser as User;
   }
}