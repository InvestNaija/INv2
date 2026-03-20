import { Table, Column, DataType, Model } from "sequelize-typescript";

@Table({
   tableName: "offerings",
   paranoid: true,
   timestamps: true,
   underscored: true,
})
export class Offering extends Model {

   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({ type: DataType.STRING(255), allowNull: false })
   declare name: string;

   @Column({ type: DataType.TEXT })
   declare description: string;
   
   @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
   declare offerPrice: number;

   @Column({ type: DataType.STRING(3), defaultValue: "NGN" })
   declare currency: string;
   
   @Column({ type: DataType.INTEGER, allowNull: false })
   declare minimumUnitsToPurchase: number;

   @Column({ type: DataType.INTEGER, allowNull: false })
   declare subsequentMultipleUnits: number;

   @Column({ type: DataType.DATE, allowNull: false })
   declare openingDate: Date;

   @Column({ type: DataType.DATE, allowNull: false })
   declare closingDate: Date;
   
   @Column({ type: DataType.DATE })
   declare createdAt: Date;
   @Column({ type: DataType.DATE })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE })
   declare deletedAt: Date;
}
