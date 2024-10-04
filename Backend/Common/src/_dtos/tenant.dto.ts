import { IsAlphanumeric, IsBoolean, IsEmail, IsString, IsUUID } from "class-validator";

export class TenantDto {
   
   @IsUUID(4)
   declare id: string;
   @IsUUID(4) 
   declare pId: string;
   @IsString()
   declare name: string;
   @IsAlphanumeric()
   declare tenantType: string | number;
   @IsString()
   declare code: string;
   @IsEmail()
   declare email: string;
   @IsAlphanumeric()
   declare phone: string;
   @IsBoolean()
   declare isEnabled: string;
   @IsBoolean()
   declare isLocked: string;
}