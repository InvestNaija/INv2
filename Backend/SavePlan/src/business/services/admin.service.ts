import { IResponse, DBEnums, Exception, handleError, } from "@inv2/common";
import { SavePlan, } from "../../domain/sequelize/INv2";
import { SaveplanDto } from "../../api/_dtos";
import { Transaction } from "sequelize";

export class AdminService {

   async list(type: string|number): Promise<IResponse> {
      try {
         const saveplans = await SavePlan.findAndCountAll({
            attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
            where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
         });

         return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async create(body: SaveplanDto): Promise<IResponse> {
      try {
         const saveplan = await SavePlan.create({
            ...body
         });
         return { success: true, code: 201, message: `User created successfully`, data: saveplan };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
   async update(id: string, body: Partial<SaveplanDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await SavePlan.sequelize?.transaction()) as Transaction;    
      try {
         const saveplan = await SavePlan.findByPk(id, {transaction: t});
         if(!saveplan) throw new Exception({code: 400, message: `Plan not found`});

         saveplan.update({
            ...body
         }, {transaction: t});

         if(!transaction) await t.commit();
         return { success: true, code: 201, message: `User created successfully`, data: saveplan };
      } catch (error) {
         if(!transaction) await t.rollback();
         throw new Exception(handleError(error));
      }
   }
}