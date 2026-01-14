/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
import { injectable } from "inversify";
import { User } from "../../../../domain/typeorm/INv2/user.entity";
import { IUserRepository } from "../../IUserRepository";
import {  getDbCxn } from "../../../../domain";
import { QueryRunner, Repository } from "typeorm";
import { IQueryOptions } from "../../../../../../Common/src/database/IGenericRepository";
import { CreateUserDto, CustomError, Exception } from "@inv2/common";

@injectable()
export class UserRepository implements IUserRepository {
   private repo: Repository<User>;
   constructor() {
      this.repo = getDbCxn('toINv2')?.getRepository(User);
   }
   // create<T>(createUserDto: CreateUserDto, options?: Partial<IQueryOptions>): Promise<T | null> {
   //    throw new Error("Method not implemented.");
   // }

   async transaction(): Promise<QueryRunner> {
      const queryRunner = getDbCxn().toINv2?.createQueryRunner();
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
   async create<User>(data: CreateUserDto, options?: Partial<IQueryOptions>): Promise<User | null> {
      const t: QueryRunner = options?.transaction ?? await this.transaction();
      try {
         const user = this.repo.create({
            // id: data.user!.id,
            details: JSON.stringify(data.user),
            // version: data.user.version,
            tenantRoles: JSON.stringify([{...data.tenant, roles: [data.role]}])
         });
         await this.repo.save(user,);
         if(!options?.transaction) await this.commit(t);
         return user as User;
      } catch (err) {
         const error = (err as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: error!.message, success: false});
      }
   }
   async update<User>(id: string, attributes?: Partial<User>, options?: Partial<IQueryOptions>): Promise<User | null> {
      const t: QueryRunner = options?.transaction ?? await this.transaction();
      try {
         await this.repo.update(id, {...attributes});
         const updatedUser = await this.repo.findOne({where:{id}});
         if(!options?.transaction) await this.commit(t);
         return updatedUser as User;
      } catch (err) {
         const error = (err as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: error!.message, success: false});
      }
   }
}