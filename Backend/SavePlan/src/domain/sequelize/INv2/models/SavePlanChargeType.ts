import { Model, Table, Column, DataType, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { DBEnums as SavePlanDBEnums } from "../../../DBEnums";
import { SavePlan } from "..";

@Table({
   timestamps: true,
   tableName: "saveplan_charge_types",
   underscored: true,
   paranoid: true,
})
export class SavePlanChargeType extends Model {

   @BelongsTo(() => SavePlan)
   declare saveplan: SavePlan;
   
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

   @Column({ type: DataType.STRING, })
   declare name: string;
   @Column({ type: DataType.STRING, })
   declare glEntityId: string;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare rate: number;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare startDuration: number;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare endDuration: number;
   @Column({ type: DataType.INTEGER, })
   declare order: number;
   
   @Column({ type: DataType.SMALLINT, })
   get frequency(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('frequency');
      return SavePlanDBEnums.ChargeTypeFrequency.find(g=>g.code===rawValue);
   }
   set frequency(value: number|string) {
      const result =  SavePlanDBEnums.ChargeTypeFrequency?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('frequency', result);
   }
   @Column({ type: DataType.SMALLINT, })
   get chargedOn(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('chargedOn');
      return SavePlanDBEnums.ChargeOn.find(g=>g.code===rawValue);
   }
   set chargedOn(value: number|string) {
      const result =  SavePlanDBEnums.ChargeOn?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('chargedOn', result);
   }

   @Column({ type: DataType.BOOLEAN, })
   declare isActive: boolean;
   
}