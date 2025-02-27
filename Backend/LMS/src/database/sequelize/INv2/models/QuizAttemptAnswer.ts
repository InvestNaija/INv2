import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { Question, QuizAttempt } from "..";

@Table({
   timestamps: true,
   tableName: "quiz_attempt_answers",
   underscored: true,
   paranoid: true,
})
export class QuizAttemptAnswer extends Model {
   
   @BelongsTo(() => QuizAttempt)
   declare quizAttempt: QuizAttempt;
   @BelongsTo(() => Question)
   declare questions: Question;

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
   @ForeignKey(() => QuizAttempt)
   declare quizAttepmtId: string;
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => Question)
   declare questionId: string;

   @Column({ type: DataType.TEXT, })
   declare answerGiven: string;
   @Column({ type: DataType.DOUBLE(10,2), })
   declare answerScore: number;
}

