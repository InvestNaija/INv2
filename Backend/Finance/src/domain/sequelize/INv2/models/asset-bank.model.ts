import { Table, Column, DataType, Model, ForeignKey, BelongsTo, HasMany, } from "sequelize-typescript";
import { Asset } from "./asset.model";
import { AssetBankGateway } from "./asset-bank-gateway.model";

@Table({
   paranoid: false,
   timestamps: false,
   tableName: "asset_banks",
   underscored: true
})
export class AssetBank extends Model {
   @HasMany(() => AssetBankGateway)
   declare assetBankGateways: AssetBankGateway[];

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

   // This belongs to which asset
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => Asset)
   declare assetId: string;
   @BelongsTo(() => Asset)
   declare asset: Asset;

   @Column({
      type: DataType.STRING,
   })
   declare bankName: string;
   @Column({
      type: DataType.STRING(20),
   })
   declare accountNumber: string;
   @Column({
      type: DataType.STRING(10),
   })
   declare bankCode: string;
}