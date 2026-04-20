import { Model, Table, Column, DataType } from 'sequelize-typescript';

/**
 * Holiday Model
 * Represents a holiday record in the local InvestIN database.
 * Synced from the Auth service via RabbitMQ events to ensure high availability.
 */
@Table({
   timestamps: true,
   tableName: 'holidays',
   underscored: true,
   paranoid: true,
   version: true,
})
export class Holiday extends Model {
   @Column({ type: DataType.DATE })
   declare createdAt: Date;

   @Column({ type: DataType.DATE })
   declare updatedAt: Date;

   @Column({ type: DataType.DATE })
   declare deletedAt: Date;

   @Column({ type: DataType.INTEGER, defaultValue: 0 })
   declare version: number;

   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({ type: DataType.STRING(100), allowNull: false })
   declare name: string;

   @Column({ type: DataType.DATEONLY, allowNull: false })
   declare startDate: Date;

   @Column({ type: DataType.DATEONLY, allowNull: false })
   declare endDate: Date;

   @Column({ type: DataType.BOOLEAN, defaultValue: true })
   declare isObserved: boolean;
}
