import { Model, Table, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { User } from "..";
import { DBEnums } from "@inv2/common";

@Table({
   timestamps: true,
   tableName: "questions",
   underscored: true,
   paranoid: true,
})
export class Question extends Model {
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

   @Column({ type: DataType.STRING(300), })
   declare title: string;

   @Column({ type: DataType.TEXT, })
   declare details: string;

   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => User)
   declare userId: string;
   
   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.QuestionType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.QuestionType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
}

// export default {User};