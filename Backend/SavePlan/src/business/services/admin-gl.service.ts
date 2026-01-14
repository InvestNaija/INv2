import { IResponse, Exception, handleError, } from "@inv2/common";
import { SavePlanGLEntity, } from "../../domain/sequelize/INv2";
import { SaveplanDto } from "../../_dtos";
import { Transaction } from "sequelize";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { ISavePlanRepository } from "../repositories";

@injectable()
export class GlService {
   constructor(
      @inject(TYPES.ISavePlanRepository) 
      private readonly saveplanRepo: ISavePlanRepository,
   ){}
   async create(saveplanId: string, body: SaveplanDto): Promise<IResponse> {
      try {
         const saveplan = await SavePlanGLEntity.create({
            ...body, saveplanId
         });
         return { success: true, code: 201, message: `GL created successfully`, data: saveplan };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async findAll(saveplanId: string): Promise<IResponse> {
      try {
         const { rows, count } = await SavePlanGLEntity.findAndCountAll({ where: { saveplanId } });
         return { success: true, code: 201, message: `GLs fetched successfully`, data: rows, count };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async findOne( id: string): Promise<IResponse> {
      try {
         const { rows, count } = await SavePlanGLEntity.findOne({ where: { saveplanId } });
         return { success: true, code: 201, message: `GLs fetched successfully`, data: rows, count };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async update(id: string, body: Partial<SaveplanDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await SavePlanGLEntity.sequelize?.transaction()) as Transaction;    
      try {
         const gl = await SavePlanGLEntity.findByPk(id, {transaction: t});
         if(!gl) throw new Exception({code: 400, message: `Plan not found`});

         gl.update({
            ...body
         }, {transaction: t});

         if(!transaction) await t.commit();
         return { success: true, code: 201, message: `GL updated successfully`, data: gl };
      } catch (error) {
         if(!transaction) await t.rollback();
         throw new Exception(handleError(error));
      }
   }
}