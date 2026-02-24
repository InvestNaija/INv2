import { Model, Table, Column, DataType, ForeignKey } from "sequelize-typescript";
import { User, LMS } from "..";

@Table({
   timestamps: true,
   tableName: "user_lms",
   underscored: true,
   paranoid: true,
})
export class UserLMS extends Model {
   @ForeignKey(() => User)
   @Column
   declare userId: string;
  
   @ForeignKey(() => LMS)
   @Column
   declare lmsId: string;
   
   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   
   @Column({ type: DataType.DATEONLY, })
   declare startDate: Date;
   @Column({ type: DataType.DATEONLY, })
   declare endDate: Date;
   @Column({ type: DataType.DATEONLY, })
   declare nextBillingDate: Date;
}