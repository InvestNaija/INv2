import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Offering } from "./offering.model";

@Table({
   tableName: "orders",
   paranoid: true,
   timestamps: true,
   underscored: true,
})
export class Order extends Model {

   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({ type: DataType.UUID, allowNull: false })
   declare userId: string;
   
   @ForeignKey(() => Offering)
   @Column({ type: DataType.UUID, allowNull: false })
   declare offeringId: string;
   
   @BelongsTo(() => Offering)
   declare offering: Offering;

   @Column({ type: DataType.INTEGER, allowNull: false })
   declare units: number;
   
   @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
   declare totalAmount: number;

   @Column({ type: DataType.STRING(50), defaultValue: 'PENDING' })
   declare status: string; // PENDING, SUCCESSFUL, FAILED

   @Column({ type: DataType.STRING(500), allowNull: true })
   declare authorizationUrl: string;

   @Column({ type: DataType.DATE })
   declare createdAt: Date;
   @Column({ type: DataType.DATE })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE })
   declare deletedAt: Date;
}
