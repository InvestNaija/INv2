import { Model, Table, Column, DataType, ForeignKey, } from "sequelize-typescript";
import { User, LMS } from "../";

@Table({
   timestamps: true,
   tableName: "user_lms",
   underscored: true,
   paranoid: true,
})
export class UserLMS extends Model {
   @ForeignKey(() => User)
   @Column
   declare userId: number;
  
   @ForeignKey(() => LMS)
   @Column
   declare lmsId: number;
   
   @Column({ type: DataType.BIGINT, })
   declare price: number;
   @Column({ type: DataType.SMALLINT, })
   declare rating: number;
   @Column({ type: DataType.SMALLINT, })
   declare like: number;
}