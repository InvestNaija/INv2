import { IsAlphanumeric, IsBoolean, IsEmail, IsString, IsUUID } from "class-validator";
import { UserDto } from "./user.dto";
import { RoleDto } from "./role.dto";

export class UserTenantRoleDto {
   declare user: Partial<UserDto>;
   declare Tenant: Partial<{
      id: string;
      name: string;
      Role: Partial<RoleDto>[]
   }>[]
}
export class TenantUserRoleDto {
   declare tenant: Partial<UserDto>;
   declare User: Partial<{
      id: string;
      name: string;
      Role: Partial<RoleDto>[]
   }>[]
}