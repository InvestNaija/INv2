import { IResponse, DBEnums, Exception, handleError, } from "@inv2/common";
import { SavePlan, } from "../../domain/sequelize/INv2";
import { SaveplanDto } from "../../_dtos";
import { SaveplanCreatedPublisher, SaveplanUpdatedPublisher } from "../../events/publishers";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
import { Transaction } from "sequelize";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { ISavePlanRepository } from "../repositories";

@injectable()
export class AdminService {

   constructor(
      @inject(TYPES.ISavePlanRepository) 
      private readonly saveplanRepo: ISavePlanRepository,
   ){}
   
   async list(type?: string|number): Promise<IResponse> {
      try {

         const saveplans = await this.saveplanRepo.findAndCountAll<SaveplanDto>([
            'id', 'title', 'summary', 'type', 'currency', 'calculator', 'description', 'interestRate', 'createdAt', 'updatedAt'
         ], {
            ...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})
         });

         return { success: true, code: 201, message: `Saveplans retrieved successfully`, count: saveplans.count, data: saveplans.data };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async create(body: SaveplanDto): Promise<IResponse> {
      try {
         const saveplan = await this.saveplanRepo.create<SaveplanDto>(body);
         
         await new SaveplanCreatedPublisher(rabbitmqWrapper.connection).publish({
            ...saveplan,
         });
         return { success: true, code: 201, message: `Saveplan created successfully`, data: saveplan };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async update(id: string, body: Partial<SaveplanDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await SavePlan.sequelize?.transaction()) as Transaction;    
      try {
         const saveplan = await this.saveplanRepo.update<SaveplanDto>(id, body, {transaction: t});
         await new SaveplanUpdatedPublisher(rabbitmqWrapper.connection).publish({
            ...saveplan,
         });

         if(!transaction) await t.commit();
         return { success: true, code: 201, message: `Saveplan updated successfully`, data: saveplan };
      } catch (error) {
         if(!transaction) await t.rollback();
         throw new Exception(handleError(error));
      }
   }
}