import { injectable } from "inversify";
import { Op } from "sequelize";
import { TenantDto, IResponse } from "@inv2/common";
import { Tenant } from "../../domain/sequelize/INv2";

@injectable()
export class TenantService {
   constructor(){}
   async getTenants (params: Partial<TenantDto>): Promise<IResponse>  {
      const criteria = {
         where: {[Op.or]: [
            ...[params.id && {"id": params.id}],
            ...[params.name && {"name": params.name}],
            ...[params.code && {"code": params.code}]
         ]},
         includes: []
      };
      const data = await Tenant.findAll(criteria) || [];
      return { success: true, code: 200, show: true, message: `Tenant(s) fetched successfully`, data};
   }
}