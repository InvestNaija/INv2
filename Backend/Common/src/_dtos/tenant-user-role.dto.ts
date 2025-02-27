import { IsAlphanumeric, IsBoolean, IsEmail, IsString, IsUUID } from "class-validator";
import { UserDto } from "./user.dto";
import { RoleDto } from "./role.dto";
import { TenantDto } from "./tenant.dto";

export class UserTenantRoleDto {
   declare user: Partial<UserDto>;
   declare Tenant: Partial<{
      id: string;
      name: string;
      Roles: Partial<RoleDto>[]
   }>[]
}
export class TenantUserRoleDto {
   declare tenant: Partial<TenantDto>;
   declare User: Partial<{
      id: string;
      name: string;
      Roles: Partial<RoleDto>[]
   }>[]
}