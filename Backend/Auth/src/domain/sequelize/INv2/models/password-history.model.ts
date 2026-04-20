import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./user.model";

@Table({
   timestamps: true,
   tableName: "password_histories",
   underscored: true,
   paranoid: false,
})
export class PasswordHistory extends Model {
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @ForeignKey(() => User)
   @Column({
      type: DataType.UUID,
      allowNull: false,
   })
   declare userId: string;

   @BelongsTo(() => User)
   declare user: User;

   @Column({
      type: DataType.STRING(500),
      allowNull: false,
   })
   declare passwordHash: string;

   @Column({ type: DataType.DATE })
   declare createdAt: Date;

   @Column({ type: DataType.DATE })
   declare updatedAt: Date;
}
