import { inject, injectable } from "inversify";
import { INLogger, IResponse, DBEnums, Exception, UserTenantRoleDto, handleError, } from "@inv2/common";
import { SavePlan, SavePlanUser, } from "../../domain/sequelize/INv2";
import { SaveplanDto, SaveplanCreateDto } from "../../_dtos";
import { ISavePlanRepository } from "../repositories";
import { TYPES } from "../types";

@injectable()
export class CustomerSaveplanService {

   constructor(
      @inject(TYPES.ISavePlanRepository) 
      private readonly saveplanRepo: ISavePlanRepository,
   ){}
   async list(type: string|number): Promise<IResponse> {
      // try {
      const saveplans = await SavePlan.findAndCountAll({
         attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
         where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
      });
      return { success: true, code: 200, message: `SavePlans retrieved successfully`, count: saveplans.count, data: saveplans.rows };
      // } catch (error) {
      //    throw new Exception(handleError(error));
      // }
   }
   async create(currentUser: UserTenantRoleDto, body: Partial<SaveplanCreateDto>): Promise<IResponse> {
      try {
         const product: SaveplanDto|null = await this.saveplanRepo.findOne(
            ['id', 'title', 'minDuration', 'maxDuration', 'currency', 'interestRate'],
            {id: body.productId},
         );
         if(!product) throw new Exception({code: 404, message: `SavePlan not found`});
         const saveplanUser = await SavePlanUser.create({
            savePlanId: product.id,
            userId: currentUser.user.id,
            amount: body.amount,
            duration: body.duration,
            startDate: body.startDate,
            endDate: body.endDate,
            status: DBEnums?.SaveplanType?.find(g=>(g.name=='active'))?.code,
         });
         INLogger.log.info(`New SavePlanUser created successfully => ${JSON.stringify(saveplanUser)}`);
         return { success: true, code: 201, message: `SavePlan subscribed successfully`, data: saveplanUser  };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
}