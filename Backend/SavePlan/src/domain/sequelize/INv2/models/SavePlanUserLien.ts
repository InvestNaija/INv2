import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { SavePlanUser } from "..";

@Table({
   timestamps: true,
   tableName: "saveplan_user_liens",
   underscored: true,
   paranoid: true,
})
export class SavePlanUserLien extends Model {

   @BelongsTo(() => SavePlanUser)
   declare savePlanUser: SavePlanUser;
   
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
   declare savePlanUserId: string;

   @Column({ type: DataType.DECIMAL(10,2), })
   declare amount: number;
   @Column({ type: DataType.STRING(500), })
   declare narration: string;
   @Column({ type: DataType.BOOLEAN, })
   declare isCleared: boolean;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare balance: number;
}