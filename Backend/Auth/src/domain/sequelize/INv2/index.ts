import { Sequelize, Op } from "sequelize";
import { BvnData } from "./models/bvn-data.model";
import { Tenant } from "./models/tenant.model";
import { User } from "./models/user.model";
import { Role } from "./models/role.model";
import { TenantUserRole } from "./models/tenant-user-role.model";
import { Holiday } from "./models/holiday.model";
import { PasswordHistory } from "./models/password-history.model";

export { Sequelize, Op };
export { BvnData, Tenant, User, Role, TenantUserRole, Holiday, PasswordHistory };

export const INv2Models = [
   BvnData,
   Tenant,
   User,
   Role,
   TenantUserRole,
   Holiday,
   PasswordHistory
];
