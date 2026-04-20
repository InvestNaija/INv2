import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

/**
 * Asset Model
 * Represents an investment asset (e.g., Mutual Fund) in the system.
 */
@Table({
   tableName: 'assets',
   timestamps: true,
   underscored: true,
   paranoid: true,
})
export class Asset extends Model {
   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, defaultValue: 0 })
   declare version: number;
   /** Unique identifier for the asset (UUID) */
   @PrimaryKey
   @Default(uuidv4)
   @Column({
      type: DataType.UUID,
      allowNull: false,
   })
   declare id: string;

   /** Human-readable name of the fund/asset */
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare name: string;

   /** Internal identification code for the asset */
   @Column({
      type: DataType.STRING,
      allowNull: false,
      unique: true,
   })
   declare assetCode: string;

   /** Identification code for the asset in the 3rd party vendor application */
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare externalIdentifier: string;

   /** Detailed description of the fund for display on the UI */
   @Column({
      type: DataType.TEXT,
      allowNull: true,
   })
   declare description?: string;

   /** Current unit price of the fund */
   @Column({
      type: DataType.DECIMAL(18, 4),
      allowNull: false,
   })
   declare price: number;

   /** Current yield of the fund */
   @Column({
      type: DataType.DECIMAL(18, 4),
   })
   declare yield: number;

   /** Currency the fund is sold in (e.g., NGN, USD) */
   @Default('NGN')
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare currency: string;

   /** Minimum units a customer must purchase in a single transaction */
   @Column({
      type: DataType.DECIMAL(18, 4),
      allowNull: false,
   })
   declare minimumUnitsToPurchase: number;

   /** Multiples of units for subsequent purchases */
   @Column({
      type: DataType.DECIMAL(18, 4),
      allowNull: false,
   })
   declare subsequentMultipleUnits: number;

   /** Date when the offer opens for subscription */
   @Column({
      type: DataType.DATE,
      allowNull: false,
   })
   declare openingDate: Date;

   /** Date when the offer closes for subscription */
   @Column({
      type: DataType.DATE,
      allowNull: false,
   })
   declare closingDate: Date;
}
