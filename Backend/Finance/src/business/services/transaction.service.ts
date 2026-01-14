import { inject, injectable } from "inversify";
import { Op } from "sequelize";
import { IResponse } from "@inv2/common";
import { Txn } from "../../domain/sequelize/INv2";
import { TYPES } from "../types";
import { TxnRepository } from "../repositories/sequelize/INv2";

@injectable()
export class TransactionService {
   constructor(
      @inject(TYPES.ITxnRepository) 
      private readonly txnRepo: TxnRepository,
   ){}

   async createTxn (body: Partial<Txn>): Promise<IResponse>  {
      const txn = await this.txnRepo.create(body);

      return { success: true, code: 201, show: true, message: `Transaction created successfully`, data: txn};
   }
   
   async getTransactions (params: Partial<Txn>): Promise<IResponse>  {
      const criteria = {
         where: {[Op.or]: [
            ...[params.id && {"id": params.id}],
            ...[params.reference && {"reference": params.reference}],
         ]},
         includes: []
      };
      const data = await Txn.findAll(criteria) || [];
      return { success: true, code: 200, show: true, message: `Transaction(s) fetched successfully`, data};
   }
   
}