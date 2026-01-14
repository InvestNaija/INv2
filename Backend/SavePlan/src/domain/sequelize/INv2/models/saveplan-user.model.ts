import { Model, Table, Column, DataType, ForeignKey, HasMany, } from "sequelize-typescript";
import { User, SavePlan, SavePlanPmtTxn } from "..";

@Table({
   timestamps: true,
   tableName: "saveplan_users",
   underscored: true,
   paranoid: true,
})
export class SavePlanUser extends Model {
   @ForeignKey(() => User)
   @Column
   declare userId: number;
  
   @ForeignKey(() => SavePlan)
   @Column
   declare saveplanId: number;
   
   @HasMany(() => SavePlanPmtTxn)
   declare savePlanPmtTxns: SavePlanPmtTxn[];
   
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
   
   @Column({ type: DataType.BIGINT, })
   declare price: number;
   @Column({ type: DataType.SMALLINT, })
   declare rating: number;
   @Column({ type: DataType.SMALLINT, })
   declare like: number;
}