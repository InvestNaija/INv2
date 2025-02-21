import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { DBEnums } from "@inv2/common";
import { SavePlanAssetBank } from "..";

@Table({
   timestamps: true,
   tableName: "saveplan_asset_banks",
   underscored: true,
   paranoid: true,
})
export class SavePlanAssetBankGateway extends Model {

   @BelongsTo(() => SavePlanAssetBank)
   declare savePlanAssetBank: SavePlanAssetBank;
   
   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, })
   declare version: number;
   
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => SavePlanAssetBank)
   declare savePlanAssetBankId: string;

   @Column({ type: DataType.STRING(30), })
   declare gateway: string;
   @Column({ type: DataType.STRING(500), })
   declare businessSecret: string;
   @Column({ type: DataType.STRING, })
   declare subAccountId: string;
   @Column({ type: DataType.STRING(10), })
   declare metaId: string;
   @Column({ type: DataType.STRING(50), })
   declare name: string;
   @Column({ type: DataType.TEXT, })
   declare details: string;
   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.PmtType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result =  DBEnums.PmtType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
   
}