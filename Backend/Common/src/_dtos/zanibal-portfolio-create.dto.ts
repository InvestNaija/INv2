import { IsAlphanumeric, IsBoolean, IsEmail, IsNumber, IsString, IsUUID } from "class-validator";

export class ZanibalPortfolioCreateDto {
   @IsNumber()
   declare id: number;
   
}