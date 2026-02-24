import { Model, Table, Column, DataType, BelongsToMany, BeforeUpdate, BeforeCreate, BeforeFind} from "sequelize-typescript";
import { User, UserLMS } from "..";
import { DBEnums } from "@inv2/common";

@Table({
   timestamps: true,
   tableName: "lms",
   underscored: true,
   paranoid: true,
   version: true,
})
export class LMS extends Model {
   
   @BelongsToMany(() => User, () => UserLMS)
   declare users: User[];
   
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

   @Column({ type: DataType.STRING(300), })
   declare title: string;

   @Column({ type: DataType.SMALLINT, allowNull: false, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.LMSType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.LMSType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }

   @Column({ type: DataType.STRING(1000), })
   declare summary: string;
   @Column({ type: DataType.TEXT, })
   declare content: string;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare price: number;

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

// export default {User};