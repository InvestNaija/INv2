import { IsString, IsUUID } from "class-validator";

export class RoleDto {
   @IsUUID(4)
   declare id: string;
   @IsString()
   declare name: string;
   @IsString()
   declare description: string;
}