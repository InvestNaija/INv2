/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
import { injectable } from "inversify";
import { User } from "../../../../domain/typeorm/INv2/models/user.entity";
import { IUserRepository } from "../../IUserRepository";
import datasource from "../../../../domain";
import { QueryRunner, Repository } from "typeorm";
import { IQueryOptions } from "../../../../../../Common/src/database/IGenericRepository";
import { UserDto } from "@inv2/common";

@injectable()
export class UserRepository implements IUserRepository {
   private repo: Repository<User>;
   constructor() {
      this.repo = datasource.toINv2?.getRepository(User);
   }

   async transaction(): Promise<QueryRunner> {
      const queryRunner = datasource.toINv2?.createQueryRunner();
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
   async findByEmail<T>(email: string, attributes: string[], tenantId?: string, options?: IQueryOptions): Promise<T | null> {
      const t = options?.transaction ?? await this.transaction();
      const queryBuilder = this.repo.createQueryBuilder("user");
      queryBuilder.where("user.email = :email", { email });

      if (tenantId) {
         queryBuilder.andWhere("user.tenantId = :tenantId", { tenantId });
      }

      if (attributes && attributes.length > 0) {
         queryBuilder.select(attributes.map(attr => `user.${attr}`));
      }

      const user = await queryBuilder.getOne();
      if(!options?.transaction) await this.commit(t);
      return user as T | null;
   }

   async findOne<T>(attributes: string[], where: any, includes?: any[]): Promise<T | null> {
      const queryBuilder = this.repo.createQueryBuilder("user");

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
      await this.repo.update(id, attributes || {});
      const updatedUser = await this.repo.findOne({where:{id}});
      if(!options?.transaction) await this.commit(t);
      return updatedUser as User;
   }
}