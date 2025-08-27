/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
import { injectable } from "inversify";
import { Repository } from "sequelize-typescript";
import { Exception } from "@inv2/common";
import { Transaction } from "sequelize";
import { IQueryOptions } from "../../../../../../Common/src/database/IGenericRepository";
import { ISavePlanRepository } from "../../ISavePlanRepository";
import { SavePlan, } from "../../../../domain/sequelize/INv2";
import { getDbCxn } from "../../../../domain";

@injectable()
export class SavePlanRepository implements ISavePlanRepository {
   get repo(): Repository<SavePlan> {return getDbCxn()?.getRepository(SavePlan);}

   public async transaction(): Promise<Transaction> {
      return await  getDbCxn()?.transaction();
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

   public async findAll<T>(attributes: string[], where: any, includes?: any[]): Promise<T[]> {
      const users = await this.repo.findAll({
         attributes,
         where,
         include: includes || [],
      });
      return users as T[];
   }

   public async findAndCountAll<T>(attributes: string[], where: any, includes?: any[]): Promise<{data: T[], count: number}> {
      const users = await this.repo.findAndCountAll({
         attributes,
         where,
         include: includes || [],
      });
      return {data: (users.rows as T[]), count: users.count};
   }

   public async update<SaveplanDto>(id: string, attributes?: Partial<SaveplanDto>, options?: Partial<IQueryOptions>): Promise<SaveplanDto | null> {
      const t: Transaction = options?.transaction ?? await this.transaction();
      
      const user = await this.repo.findByPk(id);
      if(!user) throw new Exception({code: 404, message: `Couldn't find saveplan`});
      await this.repo.update({...attributes}, {where: {id}, transaction: t});
      await user.update({...attributes}, {transaction: t});

      if(!options?.transaction) await this.commit(t);
      return user as SaveplanDto;
   }
   
   public async create<SaveplanDto>(createUserDto: SaveplanDto): Promise<SaveplanDto> {
      const saveplan = await this.repo.create(createUserDto as any);
      return saveplan as SaveplanDto;
   }
}