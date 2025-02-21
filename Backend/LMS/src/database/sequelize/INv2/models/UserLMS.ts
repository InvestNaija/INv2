import { Model, Table, Column, DataType, ForeignKey, BeforeUpdate, BeforeCreate, BeforeFind } from "sequelize-typescript";
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
   declare userId: string;
  
   @ForeignKey(() => LMS)
   @Column
   declare lmsId: string;
   
   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   
   @Column({ type: DataType.DATEONLY, })
   declare startDate: Date;
   @Column({ type: DataType.DATEONLY, })
   declare endDate: Date;
   @Column({ type: DataType.DATEONLY, })
   declare nextBillingDate: Date;

      @BeforeFind
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static async beforeReturn(options: any) {
         options?.attributes?.push('version');
      }
      @BeforeUpdate
      @BeforeCreate
      static async changes(instance: User) {
         if(instance.isNewRecord) { 
            instance.version = 0;
         }else{
            instance.version++;
         }
      }
}