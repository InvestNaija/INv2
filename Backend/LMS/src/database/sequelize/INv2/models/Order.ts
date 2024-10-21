import { Model, Table, Column, DataType, ForeignKey, BelongsTo, } from "sequelize-typescript";
import { User } from "..";
import { DBEnums } from "@inv2/common";

@Table({
   timestamps: true,
   tableName: "orders",
   underscored: true,
   paranoid: true,
})
export class Order extends Model {
   
   @BelongsTo(() => User)
   declare user: User;
   
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
   @ForeignKey(() => User)
   declare userId: string;
   
   @Column({ type: DataType.STRING(100), })
   declare orderNo: string;
   
   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.OrderStatus.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.OrderStatus?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
}