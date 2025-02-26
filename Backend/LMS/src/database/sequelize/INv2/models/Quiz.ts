import { Model, Table, Column, DataType, ForeignKey, BelongsTo, } from "sequelize-typescript";
import { LMS } from "..";
import { User } from "..";

@Table({
   timestamps: true,
   tableName: "quizzes",
   underscored: true,
   paranoid: true,
})
export class Quiz extends Model {

   @BelongsTo(() => LMS)
   declare lms: LMS;
   @BelongsTo(() => User)
   declare users: User;

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
   @ForeignKey(() => LMS)
   declare lmsId: string;
   
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => User)
   declare userId: string;

   @Column({ type: DataType.STRING(300), })
   declare title: string;
   @Column({ type: DataType.TEXT, })
   declare detail: string;
   @Column({ type: DataType.DATE, })
   declare startDate: Date;
   @Column({ type: DataType.DATE, })
   declare endDate: Date;
   @Column({ type: DataType.BOOLEAN, })
   declare isImmediateAnswer: boolean;
}

// export default {User};