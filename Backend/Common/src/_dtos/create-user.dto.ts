import { TenantDto, UserDto, RoleDto } from ".";

export class CreateUserDto {
   declare tenant: Partial<TenantDto>;
   declare user: Partial<UserDto>;
   declare role: Partial<RoleDto>;
}