import { IsEmail, IsOptional, IsString } from "class-validator";

export class LoginDto {
   @IsEmail()
   declare email: string;
   @IsString({message: `Password is required`})
   declare password: string;
   @IsOptional()
   declare deviceToken: string;
   @IsOptional()
   declare channel: string;
   @IsOptional()
   declare deviceId: string;
   @IsOptional()
   declare deviceName: string;
}