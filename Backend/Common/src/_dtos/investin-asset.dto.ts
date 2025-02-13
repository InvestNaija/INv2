import { IsAlphanumeric, IsBoolean, IsDate, IsEmail, IsNumber, IsString, IsUUID } from "class-validator";

export class TenantDto {
   
   @IsUUID(4)
   declare id: string;
   @IsUUID(4) 
   declare pId: string;
   @IsString()
   declare name: string;
   @IsAlphanumeric()
   declare assetCode: string;
   @IsString()
   declare description: string;
   @IsString()
   declare currency: string;
   @IsNumber()
   declare price: string;
   @IsNumber()
   declare yield: string;
   @IsString()
   declare categoryRange: string;
   @IsDate()
   declare openingDate: string;
}