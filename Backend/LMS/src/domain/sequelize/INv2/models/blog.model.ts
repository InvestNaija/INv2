import { Model, Table, Column, DataType, ForeignKey, BelongsTo, } from "sequelize-typescript";
import { LMS, User } from "..";

@Table({
   timestamps: true,
   tableName: "blogs",
   underscored: true,
   paranoid: true,
})
export class Blog extends Model {
      
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
   @Column({ type: DataType.UUID })
   declare pId: string;

   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => LMS)
   declare lmsId: string;
   @BelongsTo(() => LMS)
   declare lms: LMS;
   
   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => User)
   declare userId: string;
   @BelongsTo(() => User)
   declare user: User;

   @Column({ type: DataType.TEXT, })
   declare message: string;
   @Column({ type: DataType.BOOLEAN, })
   declare isEdited: boolean;
   @Column({ type: DataType.BOOLEAN, })
   declare isApproved: boolean;
}

// export default {User};