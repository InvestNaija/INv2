import { DBEnums } from "@inv2/common";
import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "..";

@Table({
   tableName: "transactions",
   paranoid: true,
   timestamps: true,
   underscored: true,
   version: true,
   indexes: [
      {
         name: ' transaction_reference_created_at_idx',
         fields: ['reference', 'created_at'],
      }
   ]
})
export class Txn extends Model {

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

   @Column({
      type: DataType.STRING(50),
      allowNull: false,
      unique: true
   })
   declare reference: string;

   @Column({
      type: DataType.STRING(100),
   })
   declare gatewayRef: string;
   
   @Column({
      type: DataType.DECIMAL,
   })
   declare amount: number;
   @Column({
      type: DataType.STRING(3),
      defaultValue: "NGN"
   })
   declare currency: string;
   
   @Column({
      type: DataType.STRING(500),
   })
   declare description: string;
   
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => User)
   declare userId: string;
   @BelongsTo(() => User)
   declare user: User;
   
   @Column({
      type: DataType.STRING(20),
   })
   declare module: string;
   @Column({ type: DataType.UUID })
   declare moduleId: string;
   // Status mapping to DBEnums.OrderStatus i.e. pending, completed, failed, etc.
   @Column({ type: DataType.SMALLINT, })
   get status(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('status');
      return DBEnums.OrderStatus.find(g=>g.code===rawValue);
   }
   set status(value: number|string) {
      const result = DBEnums?.OrderStatus?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('status', result);
   }
   // This holds payment types i.e. credit, debit.
   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.PmtType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.PmtType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
   @Column({
      type: DataType.TEXT,
   })
   declare callbackParams: string;
   @Column({
      type: DataType.TEXT,
   })
   declare gatewayResponse: string;
}