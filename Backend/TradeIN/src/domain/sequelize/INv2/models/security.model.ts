import { Model, Table, Column, DataType } from "sequelize-typescript";

@Table({
   timestamps: true,
   tableName: "securities",
   underscored: true,
   paranoid: true,
})
export class Security extends Model {
   
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

   @Column({ type: DataType.STRING, })
   declare symbol: string;

   @Column({
      type: DataType.BOOLEAN,
      defaultValue: false
   })
   declare recommended: boolean;

   @Column({ type: DataType.INTEGER, })
   declare order: number;

   @Column({
      type: DataType.BOOLEAN,
      defaultValue: true
   })
   declare watchlist: boolean;

   @Column({ type: DataType.UUID, })
   declare customerId: string;
}
