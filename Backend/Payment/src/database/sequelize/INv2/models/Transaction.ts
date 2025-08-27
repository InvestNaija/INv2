import { Model, Table, Column, DataType, } from "sequelize-typescript";

@Table({
   timestamps: true,
   tableName: "users",
   underscored: true,
   paranoid: true,
})
export class User extends Model {

   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, defaultValue: 0 })
   declare version: number;

   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({ type: DataType.STRING(100), })
   declare module: string;
   @Column({ type: DataType.UUID })
   declare moduleId: string;

   @Column({ type: DataType.STRING(100), })
   declare reference: string; 

   @Column({ type: DataType.STRING(10), })
   declare currency: string;

   @Column({ type: DataType.STRING(100), })
   declare amount: string;

   @Column({ type: DataType.STRING(255), })
   declare description: string;
   /**
   * Should hold a stringified data containig important information
   * about the transaction, such as user details or payment method.
   * This is useful for callbacks or notifications.
   * The format should be a JSON string.
   * Example: {"channel": "paystack", "userId": "12345", "paymentMethod": "card"}
   */
   @Column({type: DataType.TEXT,})
   get callbackParams(): string {
      return JSON.parse(this.getDataValue('callback_params'));
   }  
   set callbackParams(value: string) {
      this.setDataValue('callback_params', JSON.stringify(value));
   }
}
