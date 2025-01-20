import { Model, Table, Column, DataType, BeforeUpdate, BeforeCreate, } from "sequelize-typescript";
import { DBEnums as InvestINDBEnums } from "../../../DBEnums";

@Table({
   timestamps: true,
   tableName: "assets",
   underscored: true,
   paranoid: true,
})
export class GLEntity extends Model {
   
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
   
   @Column({ type: DataType.STRING(30) })
   declare name: string;
   
   @Column({ type: DataType.SMALLINT, })
   get category(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('category');
      return InvestINDBEnums.AssetCategory.find(g=>g.code===rawValue);
   }
   set category(value: number|string) {
      const result = InvestINDBEnums?.AssetCategory?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('category', result);
   }

   @Column({ type: DataType.STRING, })
   declare description: string;
   @Column({ type: DataType.STRING(3), })
   declare currency: number;

   @Column({ type: DataType.DATE, })
   declare openingDate: Date;
   @Column({ type: DataType.DATE, })
   declare closingDate: Date;

   @BeforeUpdate
   @BeforeCreate
   static async changes(instance: GLEntity) {
      if(instance.isNewRecord) { 
         instance.version = 0;
      } else {
         instance.version++;
      }
   }
}