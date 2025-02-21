import { IsDate, IsNumber, IsString, IsUUID } from "class-validator";

export class AssetDto {
   @IsUUID(4)
   declare id: string;
   @IsString()
   declare name: string;
   @IsString()
   declare category: string;
   @IsString()
   declare assetCode: string;
   @IsString()
   declare description: string;
   @IsNumber()
   declare currency: string;
   @IsNumber()
   declare price: number;
   @IsNumber()
   declare yield: number;
   @IsString()
   declare categoryRange: string;

   @IsDate()
   declare openingDate: Date;
   @IsDate()
   declare closingDate: Date;
   @IsDate()
   declare allocationDate: Date;
   @IsDate()
   declare fundingDate: Date;
   @IsDate()
   declare maturityDate: Date;

   @IsNumber()
   declare anticipatedMinPrice: number;
   @IsNumber()
   declare anticipatedMaxPrice: number;
   @IsNumber()
   declare unitsAvailableForSale: number;
   @IsNumber()
   declare minPurchaseUnits: number;
   @IsNumber()
   declare subsequentMultiples: number;
   @IsNumber()
   declare subsequentMinAmt: number;
}