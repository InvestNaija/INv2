import { Model, Table, Column, DataType, ForeignKey, HasMany, } from "sequelize-typescript";
import { User, SavePlan, SavePlanPmtTxn } from "..";
import { DBEnums } from "@inv2/common";

@Table({
   timestamps: true,
   tableName: "saveplan_users",
   underscored: true,
   paranoid: true,
})
export class SavePlanUser extends Model {
   
   @HasMany(() => SavePlanPmtTxn)
   declare savePlanPmtTxns: SavePlanPmtTxn[];
   
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
   @Column
   @ForeignKey(() => User)
   declare userId: string;
   @Column
   @ForeignKey(() => SavePlan)
   declare saveplanId: string;
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare title: string;
   @Column({
      type: DataType.STRING(1000),
   })
   declare description: string;
   @Column({ type: DataType.DOUBLE, })
   declare pmt: number;
   @Column({ type: DataType.STRING, })
   declare frequency: string;
   @Column({ type: DataType.INTEGER, })
   declare duration: number;
   @Column({ type: DataType.DOUBLE, })
   declare futureValue: number;
   @Column({ type: DataType.DOUBLE, })
   declare totalContributionAmt: number;
   @Column({ type: DataType.DOUBLE, })
   declare interestRate: number;
   @Column({ type: DataType.DOUBLE, })
   declare interestAmt: number;
   @Column({ type: DataType.DOUBLE, })
   declare effectiveInterestRate: number;
   @Column({ type: DataType.DOUBLE, })
   declare accruedInterest: number;
   @Column({ type: DataType.DATEONLY, })
   /** Start date for this plan */
   declare startDate: Date;
   @Column({ type: DataType.DATEONLY, })
   /** End date for this plan */
   declare endDate: Date;
   @Column({ type: DataType.DATEONLY, })
   /** Next billing date for this plan */
   declare nextBillingDate: Date;
   /** Last date interest was paid for this plan */
   @Column({ type: DataType.DATEONLY, })
   declare lastInterestPayDate: Date;
   /** Status of this plan. Used to be stored as boolean, now stored in the DBEnums */
   @Column({ type: DataType.SMALLINT, })
   get status(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('status');
      return DBEnums.OrderStatus.find(g=>g.code===rawValue);
   }
   set status(value: number|string) {
      const result = DBEnums?.OrderStatus?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('status', result);
   }
   /** Gateway you want to use for this plan. Now stored in the DBEnums. Can easily be changed if needed */
   @Column({ type: DataType.SMALLINT, })
   get gateway(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('gateway');
      return DBEnums.Gateway.find(g=>g.code===rawValue);
   }
   set gateway(value: number|string) {
      const result = DBEnums?.Gateway?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('gateway', result);
   }
   @Column({ type: DataType.DOUBLE, })
   declare totalPaid: number;
   @Column({ type: DataType.DOUBLE, })
   declare totalPrincipal: number;
   @Column({ type: DataType.BOOLEAN, })
   declare isLocked: boolean;
}