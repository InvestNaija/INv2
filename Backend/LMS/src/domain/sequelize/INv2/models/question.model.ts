import { Model, Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { DBEnums } from "@inv2/common";
import { Quiz, User } from "..";

@Table({
   timestamps: true,
   tableName: "questions",
   underscored: true,
   paranoid: true,
})
export class Question extends Model {
   
   @BelongsTo(() => Quiz)
   declare quiz: Quiz;
   
   @BelongsTo(() => User)
   declare creator: User;
   
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

   @Column({ type: DataType.STRING(200), })
   declare title: string;

   @Column({ type: DataType.TEXT, })
   declare details: string;
   
   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.QuestionType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      // Map abbreviated forms to DBEnums labels
      const typeMap: { [key: string]: string } = {
         'Boolean': 'Yes/No',
         'MCSA': 'MultiChoice-SingleAnswer',
         'MCMA': 'Multi Choice-MultiAnswer',
         'MTC': 'Match The Column',
         'SA': 'Short Answer',
         'LA': 'Long Answer',
      };
      
      const mappedValue = typeof value === 'string' && typeMap[value] ? typeMap[value] : value;
      const result = DBEnums?.QuestionType?.find(g=>(g.code==mappedValue || g.label==mappedValue || g.name==mappedValue))?.code;
      this.setDataValue('type', result);
   }
}

// export default {User};