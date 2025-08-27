import { Model, Table, Column, DataType, ForeignKey, BelongsTo, } from "sequelize-typescript";
import { Order } from "..";

@Table({
   timestamps: true,
   tableName: "order_items",
   underscored: true,
   paranoid: true,
})
export class OrderItem extends Model {
   
   @BelongsTo(() => Order)
   declare orders: Order;
   
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
   @ForeignKey(() => Order)
   declare orderId: string;
   
}
