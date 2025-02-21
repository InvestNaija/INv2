import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { DBEnums } from "@inv2/common";
import { SavePlan, GLEntity } from "..";

@Table({
   timestamps: true,
   tableName: "saveplan_asset_banks",
   underscored: true,
   paranoid: true,
})
export class SavePlanAssetBank extends Model {

   @BelongsTo(() => SavePlan)
   declare saveplan: SavePlan;
   @BelongsTo(() => GLEntity)
   declare glEntity: GLEntity;
   
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
   @Column({ type: DataType.UUID })
   declare pId: string;

   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => SavePlan)
   declare saveplanId: string;
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => GLEntity)
   declare glEntityId: string;

   @Column({ type: DataType.STRING, })
   declare bankName: string;
   @Column({ type: DataType.STRING, })
   declare nameOnAccount: string;
   @Column({ type: DataType.STRING(20), })
   declare accountNumber: string;
   @Column({ type: DataType.STRING(10), })
   declare bankCode: string;
   @Column({ type: DataType.STRING, })
   declare businessName: string;
   @Column({ type: DataType.STRING, })
   declare email: string;
   @Column({ type: DataType.SMALLINT, })
   get txnType(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('txnType');
      return DBEnums.PmtType.find(g=>g.code===rawValue);
   }
   set txnType(value: number|string) {
      const result =  DBEnums.PmtType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('txnType', result);
   }
   @Column({ type: DataType.SMALLINT, })
   declare split: string;
   
}