import { Table, Column, DataType, Model, ForeignKey, BelongsTo, } from "sequelize-typescript";
import { AssetBank } from "./asset-bank.model";

@Table({
   paranoid: false,
   timestamps: false,
   tableName: "asset_bank_gateways",
   underscored: true
})
export class AssetBankGateway extends Model {


   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, defaultValue: 0 })
   declare version: number;
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;
   // This belongs to which asset bank
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => AssetBank)
   declare assetBankId: string;
   @BelongsTo(() => AssetBank)
   declare assetBank: AssetBank;
   // This is the gateway name e.g. paystack, flutterwave, etc.
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare gateway: string;
   // This is the merchant id or equivalent identifier for the gateway
   @Column({
      type: DataType.STRING,
   })
   declare merchantSecret: string;
   // This is the logo of the gateway
   @Column({
      type: DataType.STRING(500),
   })
   declare logo: string;

   // This has to contain things like subaccount id, meta id, api keys, etc. e.g. {"subaccount_id": "XXXX", "api_key": "XXXX" }
   @Column({
      type: DataType.STRING,
   })
   declare details: string;
}