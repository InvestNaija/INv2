import { IsAlphanumeric, IsBoolean, IsEmail, IsNumber, IsString, IsUUID } from "class-validator";

export enum EValidatorType {
   createCustomer= 'createCustomer',
   customerUpdate = 'customerUpdate',
   customerUpdateBankAcc = 'customerUpdateBankAcc'
}
export class ZanibalCustomerCreateDto {
   @IsNumber()
   declare id: number;
   
   @IsString()
   declare businessOfficeName: string;
   @IsString()
   declare customerGroupName: string;
   @IsString()
   declare customerType: string;
   @IsString()
   declare partnerType: string;

   @IsString()
   declare firstName: string;
   @IsString()
   declare middleName: string;
   @IsString()
   declare lastName: string;
   @IsString()
   declare channel: string;
   @IsString()
   declare birthDate: string;
   @IsString()
   declare bvnCode: string;
   @IsString()
   declare emailAddress1: string;
   @IsString()
   declare cellPhone: string;
   @IsString()
   declare sex: string;
   @IsString()
   declare picture: string;
   @IsString()
   declare primaryAddress1: string;
   @IsString()
   declare primaryAddress2: string;
   @IsString()
   declare primaryCity: string;
   @IsString()
   declare primaryState: string;
   @IsString()
   declare primaryCountry: string;
   @IsString()
   declare nationality: string;
   @IsString()
   declare motherMaidenName: string;
   @IsString()
   declare placeOfBirth: string;
   @IsString()
   declare nexofKin: string;
   @IsString()
   declare nexofKinEmailAddress: string;
   @IsString()
   declare nextofKinAddress: string;
   @IsString()
   declare nextofKinPhone: string;
   @IsString()
   declare nextofKinRelationship: string;
   @IsString()
   declare setttlementBankAccountNumber: string;
   @IsString()
   declare setttlementBankAccountName: string;
   @IsString()
   declare setttlementBankName: string;
   @IsString()
   declare portalUserName: string;
   @IsString()
   declare referalCode: string; // This is the auto generated code we generate for a customer
   @IsString()
   declare referrer: string; // This is the code of the person who referred you

   @IsString()
   declare portfolioTypeName: string;

   @IsBoolean()
   declare active: boolean;

   @IsString()
   declare validatorType: EValidatorType;
   
}