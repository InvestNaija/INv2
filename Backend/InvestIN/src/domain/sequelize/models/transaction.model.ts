import { DBEnums } from '@inv2/common/build';
import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

/**
 * AssetTransaction Model
 * Logs all investment-related transactions, including vendor interactions
 * and payment status from the Finance microservice.
 */
@Table({
   tableName: 'transactions',
   timestamps: true,
   underscored: true,
})
export class AssetTransaction extends Model {
   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, defaultValue: 0 })
   declare version: number;
   @PrimaryKey
   @Default(uuidv4)
   @Column({
      type: DataType.UUID,
      allowNull: false,
   })
   declare id: string;

   /** Name of the vendor (e.g., 'zanibal', 'infoware') */
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare vendor: string;

   /** Module on the vendor side (e.g., 'fund', 'fgnsb') */
   @Default('fund')
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare module: string;

   /** ID returned from the vendor upon successful posting */
   @Column({
      type: DataType.STRING,
      allowNull: true,
   })
   declare moduleId?: string;

   /** ID of the customer initiating the transaction */
   @Column({
      type: DataType.UUID,
      allowNull: false,
   })
   declare customerId: string;

   /** ID returned from the Finance microservice */
   @Column({
      type: DataType.STRING,
      allowNull: true,
   })
   declare transactionId?: string;

   /** Type of transaction: 'subscription' or 'redemption' */
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare transactionType: string;

   /** The exact JSON payload sent to the vendor */
   @Column({
      type: DataType.JSONB,
      allowNull: true,
   })
   declare request?: any;

   /** The exact JSON response received from the vendor */
   @Column({
      type: DataType.JSONB,
      allowNull: true,
   })
   declare response?: any;

   @Column({ type: DataType.SMALLINT, })
   get status(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('status');
      return DBEnums.OrderStatus.find(g=>g.code===rawValue);
   }
   set status(value: number|string) {
      const result = DBEnums?.OrderStatus?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('status', result);
   }
   
   @Column({ type: DataType.SMALLINT, })
   get paymentStatus(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('paymentStatus');
      return DBEnums.OrderStatus.find(g=>g.code===rawValue);
   }
   set paymentStatus(value: number|string) {
      const result = DBEnums?.OrderStatus?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('paymentStatus', result);
   }

   /** The transaction amount */
   @Column({
      type: DataType.DECIMAL(18, 4),
      allowNull: false,
   })
   declare amount: number;

   /** The transaction currency (e.g., 'NGN', 'USD') */
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare currency: string;

   /** The ID of the asset involved in this transaction */
   @Column({
      type: DataType.UUID,
      allowNull: false,
   })
   declare assetId: string;

   /** The ID of the portfolio to which the asset belongs */
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare portfolioId: string;

   /** The date when the transaction is targeted to be posted */
   @Column({
      type: DataType.DATEONLY,
      allowNull: true,
   })
   declare postdate?: Date | string;
}
