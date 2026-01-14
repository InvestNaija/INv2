import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { Quiz, User } from "..";

@Table({
   timestamps: true,
   tableName: "quiz_attempts",
   underscored: true,
   paranoid: true,
})
export class QuizAttempt extends Model {
   
   @BelongsTo(() => Quiz)
   declare quizzes: Quiz;
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
   @ForeignKey(() => Quiz)
   declare quizId: string;
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => User)
   declare userId: string;
}

