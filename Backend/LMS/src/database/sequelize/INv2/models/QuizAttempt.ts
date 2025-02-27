import { Model, Table, Column, DataType, BelongsTo, ForeignKey, HasMany } from "sequelize-typescript";
import { Quiz, QuizAttemptAnswer, User } from "..";

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
   @HasMany(() => QuizAttemptAnswer)
   declare quizAttemptAnswers: QuizAttemptAnswer[];

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
   @Column({
      type: DataType.DATE,
      defaultValue: DataType.NOW,
   })
   declare attemptStart: Date;
   @Column({
      type: DataType.DATE,
      allowNull: true,
      defaultValue: null
   })
   declare attemptEnd: Date;
   @Column({
      type: DataType.STRING,
      allowNull: true,
      defaultValue: null,
   })
   declare attemptIp: string;
}

