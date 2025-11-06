/* eslint-disable @typescript-eslint/no-explicit-any */
import { Txn, } from "../../../../domain/sequelize/INv2";
import { ITxnRepository } from "../../ITxnRepository";
import { getDbCxn } from "../../../../domain";
import { injectable } from "inversify";
import { Exception, } from "@inv2/common";
import { Transaction } from "sequelize";
import { IQueryOptions } from "../../../../../../Common/src/database/IGenericRepository";

@injectable()
export class TxnRepository implements ITxnRepository {
   get txnRepo() {return getDbCxn()?.getRepository(Txn);}
   
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
      const txn = await this.txnRepo.findOne({
         attributes,
         where,
         include: includes || [],
      });
      return txn as T | null;
   }

   public async findByReference<T>(email: string, attributes: string[], options: IQueryOptions): Promise<T> {

      return {email, attributes, options } as T;      
   }
   public async update<Txn>(id: string, attributes?: Partial<Txn>, options?: IQueryOptions): Promise<Txn | null> {
      const t: Transaction = options?.transaction ?? await this.transaction();
      
      try {
         const user = await this.txnRepo.findByPk(id);
         if(!user) throw new Exception({code: 404, message: `Couldn't find transaction with id ${id}`});

         await user.update({...attributes}, {transaction: t});

         if(!options?.transaction) await this.commit(t);
         return user as Txn;
      } catch (error: unknown|Error) {
         await this.rollback(t);
         console.log((error as Error).message);
         return Promise.reject(error);
      }
   }
   public async create<T>(txnDTO: Partial<T>, options?: IQueryOptions): Promise<T> {
      const t: Transaction = options?.transaction ?? await this.transaction();
      try {
         const txn = await this.txnRepo.create(txnDTO, {transaction: t});
         
         if(!options?.transaction) await this.commit(t);
         return txn;
      } catch (error: unknown|Error) {
         await this.rollback(t);
         console.log((error as Error).message);
         throw new Exception({code: 500, message: "Failed to create transaction"});
      }
   }
}