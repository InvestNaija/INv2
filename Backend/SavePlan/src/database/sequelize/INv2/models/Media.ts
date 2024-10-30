import { Model, Table, Column, DataType, } from "sequelize-typescript";
import { DBEnums } from "@inv2/common";

@Table({
   timestamps: true,
   tableName: "media",
   underscored: true,
   paranoid: true,
})
export class Media extends Model {
   
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

   @Column({ type: DataType.STRING(100), })
   declare commonId: string;
   @Column({ type: DataType.STRING(100), })
   declare commonType: string;
   @Column({ type: DataType.STRING(100), })
   declare name: string;

   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.MediaType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.MediaType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
   
   @Column({ type: DataType.STRING(100), })
   declare mime: string;
   
   @Column({ type: DataType.INTEGER, })
   declare size: number;
   
   @Column({ type: DataType.TEXT, })
   declare resource: string;
}

// export default {User};