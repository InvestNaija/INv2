import { IsNumber, IsString, IsUUID } from "class-validator";

export class SaveplanDto {
   
   @IsUUID(4)
   declare id: string;
   @IsUUID(4) 
   declare title: string;
   @IsString()
   declare slug: string;
   @IsString()
   declare type: string;
   @IsString()
   declare calculator: string;
   @IsString()
   declare currency: string;
   @IsString()
   declare summary: string;
   @IsString()
   declare description: string;
   @IsNumber()
   declare interestRate: string;
   @IsNumber()
   declare minDuration: string;
   @IsNumber()
   declare maxDuration: string;
   @IsNumber()
   declare minAmount: string;
   @IsNumber()
   declare maxAmount: string;
}