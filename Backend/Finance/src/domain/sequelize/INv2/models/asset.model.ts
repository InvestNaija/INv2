import { Table, Column, DataType, Model, HasMany, } from "sequelize-typescript";
import { AssetBank } from "./asset-bank.model";

@Table({
   paranoid: false,
   timestamps: false,
   tableName: "assets",
   underscored: true
})
export class Asset extends Model {

   @HasMany(() => AssetBank)
   declare assetBanks: AssetBank[];

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
   // This is the module to which this asset belongs e.g. saveplan, lms, investin, etc.
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare module: string;
   @Column({
      type: DataType.UUID,
      allowNull: false,
   })
   declare moduleId: string;
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare name: string;
   
   @Column({
      type: DataType.STRING(500),
   })
   declare details: string;
}