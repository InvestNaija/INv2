import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { DBEnums } from "@inv2/common";
import { SavePlanUser } from "..";

@Table({
   timestamps: true,
   tableName: "saveplan_pmt_txns",
   underscored: true,
   paranoid: true,
})
export class SavePlanPmtTxn extends Model {

   @BelongsTo(() => SavePlanUser)
   declare saveplanUsers: SavePlanUser;
   
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
   @ForeignKey(() => SavePlanUser)
   declare saveplanUserId: string;

   @Column({ type: DataType.STRING(30), })
   declare reference: string;
   @Column({ type: DataType.STRING, })
   declare description: string;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare amount: number;
   
   @Column({ type: DataType.SMALLINT, })
   get status(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('status');
      return DBEnums.OrderStatus.find(g=>g.code===rawValue);
   }
   set status(value: number|string) {
      const result = DBEnums?.OrderStatus?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('status', result);
   }
   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.OrderStatus.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.OrderStatus?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
   @Column({ type: DataType.DATEONLY, })
   declare postDate: Date;
}