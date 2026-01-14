import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "..";

@Table({
   paranoid: true,
   timestamps: true,
   tableName: "bvn_data",
   underscored: true
})
export class BvnData extends Model {
   
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({
      type: DataType.UUID,
   })
   @ForeignKey(() => User)
   declare userId: string;
   @BelongsTo(() => User)
   declare user: User;


   @Column({
      type: DataType.STRING(13),
      unique: true,
   })
   declare bvn: string;
   
   @Column({ type: DataType.BOOLEAN, })
   declare isVerified: boolean;
   
   @Column({type: DataType.TEXT,})
   get bvnResponse(): string {
      return JSON.parse(this.getDataValue('bvnResponse'));
   }  
   set bvnResponse(value: string) {
      this.setDataValue('bvnResponse', JSON.stringify(value));
   }
}