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
   /** Title of the saveplan e.g Save a Million */
   @Column({ type: DataType.STRING(300), })
   declare title: string;
   /** A slug for the saveplan. e.g save_a_million */
   @Column({ type: DataType.STRING(300), })
   declare slug: string;
   /** Type of the saveplan. Options are planin, savein, custom and wallet */
   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.SaveplanType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.SaveplanType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
   /** Calculator to be used for this plan. Now stored in the DBEnums */
   @Column({ type: DataType.SMALLINT, })
   get calculator(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('calculator');
      return DBEnums.SaveplanCalculatorType.find(g=>g.code===rawValue);
   }
   set calculator(value: number|string) {
      const result = DBEnums?.SaveplanCalculatorType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('calculator', result);
   }
   /** Currency to be used. Currency is the global DBEnum */
   @Column({ type: DataType.SMALLINT, })
   get currency(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('currency');
      return DBEnums.Currency.find(g=>g.code===rawValue);
   }
   set currency(value: number|string) {
      const result = DBEnums?.Currency?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('currency', result);
   }
   /** A short summary that can be displayed on the UI*/
   @Column({ type: DataType.STRING(1000), })
   declare summary: string;
   /** A short summary that can be displayed on the UI*/
   @Column({ type: DataType.TEXT, })
   declare description: string;
   /** Interest for this saveplan */
   @Column({ type: DataType.DECIMAL(10,2), })
   declare interestRate: number;
   /** Interest for this saveplan */
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