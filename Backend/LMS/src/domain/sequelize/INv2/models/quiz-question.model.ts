import { Model, Table, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Quiz, Question } from "..";

@Table({
   timestamps: true,
   tableName: "quiz_questions",
   underscored: true,
   paranoid: true,
})
export class QuizQuestion extends Model {
   
   @BelongsTo(() => Quiz)
   declare quizzes: Quiz;
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
   @ForeignKey(() => Quiz)
   declare quizId: string;
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => Question)
   declare questionId: string;
   // userId is a soft reference to User (managed by Auth service)
   @Column({
      type: DataType.UUID,
   })
   declare userId: string;
   
   @Column({ type: DataType.DOUBLE(10,2), })
   declare passScrore: number;
   @Column({ type: DataType.DOUBLE(10,2), })
   declare failScrore: number;
   @Column({ type: DataType.INTEGER, })
   declare order: number;
}

