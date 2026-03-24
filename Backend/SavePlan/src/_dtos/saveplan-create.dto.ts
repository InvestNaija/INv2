import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
export class CallbackParams {
   @IsString()
   @IsOptional()
   declare gatewayId: string;
   @IsString()
   @IsOptional()
   declare redirectUrl: string;
}
export class SaveplanCreateDto {
   @IsUUID(4)
   declare productId: string;
   @IsString()
   declare title: string;
   @IsString()
   declare initialAmt: number;
   @IsNumber()
   declare amount: number;
   @IsNumber()
   declare custom: boolean;
   @IsString()
   declare frequency: string;
   @IsNumber()
   declare duration: number | string;
   @IsString()
   declare startDate: string;
   @IsString()
   declare endDate: string;
   @IsString()
   declare customEndDate: string;
   @IsString()
   declare gateway: string;
   @Type(() => CallbackParams)
   @ValidateNested()
   @IsOptional()
   declare callbackParams: CallbackParams;
}