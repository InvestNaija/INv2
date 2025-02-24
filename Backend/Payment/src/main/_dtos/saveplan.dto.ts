import { IsNumber, IsString, IsUUID } from "class-validator";

export class SaveplanDto {
   @IsUUID(4)
   declare id: string;
   @IsString()
   declare title: string;
   @IsString()
   declare slug: string;
   @IsNumber()
   declare type: string;
   @IsNumber()
   declare calculator: string;
   @IsNumber()
   declare currency: string;
   @IsString()
   declare summary: string;
   @IsString()
   declare content: string;
   @IsNumber()
   declare interestRate: number;
   @IsNumber()
   declare minDuration: number;
   @IsNumber()
   declare maxDuration: number;
   @IsNumber()
   declare minAmount: number;
   @IsNumber()
   declare maxAmount: number;
}