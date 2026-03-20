import { IsNumber, IsString, IsUUID } from "class-validator";

export class SaveplanCreateDto {
   @IsUUID(4)
   declare productId: string;
   @IsString()
   declare title: string;
   @IsString()
   declare initialAmt: number;
   @IsNumber()
   declare amount: number;
   @IsString()
   declare frequency: string;
   @IsNumber()
   declare duration: number;
   @IsNumber()
   declare startDate: string;
   @IsString()
   declare endDate: string;
   @IsString()
   declare gateway: string;
}