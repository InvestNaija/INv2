import { IsUUID, IsString, IsEmail, IsAlphanumeric, IsDateString, IsBoolean, IsNumber } from "class-validator";

export class UserDto {
   @IsNumber()
   declare version: number
   @IsUUID(4) 
   declare id: string;
   @IsUUID(4) 
   declare pId: string;
   @IsString()
   declare firstName: string;
   @IsString()
   declare middleName: string;
   @IsString()
   declare lastName: string;
   @IsString()
   declare bvn: string;
   @IsString()
   declare nin: string;
   @IsEmail()
   declare email: string;
   @IsAlphanumeric()
   declare gender: string;
   @IsDateString()
   declare dob: Date;
   @IsString()
   declare phone: string;
   @IsString()
   declare password: string;
   @IsString()
   declare refCode: string;
   @IsString()
   declare referrer: string;
   @IsBoolean()
   declare showBalance: boolean;
   @IsString()
   declare mothersMaidenName: string;
   @IsString()
   declare placeOfBirth: string;
   @IsBoolean()
   declare isEnabled: boolean;
   @IsBoolean()
   declare isLocked: boolean;
   @IsBoolean()
   declare firstLogin: boolean;
   @IsBoolean()
   declare twoFactorAuth: boolean;
}
