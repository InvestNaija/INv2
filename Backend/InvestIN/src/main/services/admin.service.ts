import { IResponse, DBEnums, Exception, handleError, } from "@inv2/common";
import { Asset, } from "../../database/sequelize/INv2";
import { AssetDto } from "../_dtos";
import { Transaction } from "sequelize";

export class AdminService {

   async create(body: AssetDto): Promise<IResponse> {
      try {
         const saveplan = await Asset.create({
            ...body
         });
      
         return { success: true, code: 201, message: `User created successfully`, data: saveplan };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async list(type: string|number): Promise<IResponse> {
      try {
         const saveplans = await Asset.findAndCountAll({
            attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
            where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
         });

         return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async update(id: string, body: Partial<AssetDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await Asset.sequelize?.transaction()) as Transaction;    
      try {
         const saveplan = await Asset.findByPk(id, {transaction: t});
         if(!saveplan) throw new Exception({code: 400, message: `Plan not found`});

         saveplan.update({
            ...body
         }, {transaction: t});

         // INLogger.log.info(`Server running on port`);
         // if(!transaction) await t.commit();
         return { success: true, code: 201, message: `User created successfully`, data: saveplan };
      } catch (error) {
         if(!transaction) await t.rollback();
         throw new Exception(handleError(error));
      }
   }
}