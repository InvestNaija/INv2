import { Model, Table, Column, DataType, HasMany, BelongsToMany, } from "sequelize-typescript";
import { User, SavePlanUser, SavePlanChargeType } from "..";
import { DBEnums } from "@inv2/common";

@Table({
   timestamps: true,
   tableName: "saveplans",
   underscored: true,
   paranoid: true,
})
export class SavePlan extends Model {
   
   @BelongsToMany(() => User, () => SavePlanUser)
   declare users: User[];
   @HasMany(() => SavePlanChargeType)
   declare saveplanChargeTypes: SavePlanChargeType[];
   
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
   @Column({ type: DataType.STRING(300), })
   declare slug: string;

   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.SaveplanType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.SaveplanType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
   @Column({ type: DataType.SMALLINT, })
   get calculator(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('calculator');
      return DBEnums.SaveplanCalculatorType.find(g=>g.code===rawValue);
   }
   set calculator(value: number|string) {
      const result = DBEnums?.SaveplanCalculatorType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('calculator', result);
   }
   @Column({ type: DataType.SMALLINT, })
   get currency(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('currency');
      return DBEnums.Currency.find(g=>g.code===rawValue);
   }
   set currency(value: number|string) {
      const result = DBEnums?.Currency?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('currency', result);
   }

   @Column({ type: DataType.STRING(1000), })
   declare summary: string;
   @Column({ type: DataType.TEXT, })
   declare content: string;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare interestRate: number;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare minDuration: number;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare maxDuration: number;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare minAmount: number;
   @Column({ type: DataType.DECIMAL(10,2), })
   declare maxAmount: number;
}

// export default {User};