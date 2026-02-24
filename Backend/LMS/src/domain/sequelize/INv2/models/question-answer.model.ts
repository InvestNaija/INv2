import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { Question } from "../index";

@Table({
   timestamps: true,
   tableName: "question_answers",
   underscored: true,
   paranoid: true,
})
export class QuestionAnswer extends Model {
   
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

   @ForeignKey(() => Question)
   declare questionId: string;

   @Column({
      type: DataType.UUID,
   })
   @Column({ type: DataType.TEXT })
   declare detail: string;
   @Column({ type: DataType.TEXT })
   declare answer: string;

   @Column({ type: DataType.BOOLEAN })
   declare isValid: boolean;
}

