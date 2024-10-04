import { Op } from "sequelize";
import { TenantDto, IResponse } from "@inv2/common";
import { Tenant } from "../../database/sequelize/INv2";

export class TenantService {
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