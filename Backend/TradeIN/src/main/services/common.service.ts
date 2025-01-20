import { INLogger, IResponse, DBEnums, } from "@inv2/common";
import { SavePlan, } from "../../database/sequelize/INv2";

export class CommonService {

   async list(type: string|number): Promise<IResponse> {
      // try {
      const saveplans = await SavePlan.findAndCountAll({
         attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
         where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
      });
      INLogger.log.info(`Server running on port`);
      return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
      // } catch (error) {
      //    throw new Exception(handleError(error));
      // }
   }
   async create(type: string|number): Promise<IResponse> {
      // try {
      const saveplans = await SavePlan.findAndCountAll({
         attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
         where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
      });
      INLogger.log.info(`Server running on port`);
      return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
      // } catch (error) {
      //    throw new Exception(handleError(error));
      // }
   }
}