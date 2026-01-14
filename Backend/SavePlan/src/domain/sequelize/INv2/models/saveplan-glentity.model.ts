import { Model, Table, Column, DataType, BelongsTo, HasMany, ForeignKey, } from "sequelize-typescript";
import { DBEnums as SavePlanDBEnums } from "../../../DBEnums";
import { SavePlan, SavePlanAssetBank } from "..";

@Table({
   timestamps: true,
   tableName: "saveplan_gl_entities",
   underscored: true,
   paranoid: true,
})
export class SavePlanGLEntity extends Model {
   @BelongsTo(() => SavePlan)
   declare saveplan: SavePlan;
   @HasMany(() => SavePlanAssetBank)
   declare savePlanAssetBanks: SavePlanAssetBank[];
   
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
   @ForeignKey(() => SavePlan)
   declare saveplanId: string;
   
   @Column({ type: DataType.STRING(30), })
   declare code: string;
   @Column({ type: DataType.STRING, })
   declare description: string;
   @Column({ type: DataType.SMALLINT, })
   declare rate: number;
   
   @Column({ type: DataType.SMALLINT, })
   get glType(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('glType');
      return SavePlanDBEnums.GLEntityType.find(g=>g.code===rawValue);
   }
   set glType(value: number|string) {
      const result = SavePlanDBEnums?.GLEntityType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('glType', result);
   }
}