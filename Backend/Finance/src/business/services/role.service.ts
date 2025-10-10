import { Op } from "sequelize";
import { IResponse } from "@inv2/common";
import { Role } from "../../domain/sequelize/INv2";
import { IsUUID, IsString } from "class-validator";
import { injectable } from "inversify";


class IRoleDto {
   @IsUUID("4") declare roleId: string;
   @IsString() declare roleName: string;
}
@injectable()
export class RoleService {
   constructor(){}
   async getRoles (params: Partial<IRoleDto>): Promise<IResponse>  {
      const criteria = {
         where: {[Op.or]: [
            ...[params.roleId && {"id": params.roleId}],
            ...[params.roleName && {"name": params.roleName}]
         ]},
         includes: []
      };
      const data = await Role.findAll(criteria) || [];
      return { success: true, code: 200, show: true, message: `Role(s) fetched successfully`, data};
   }
}