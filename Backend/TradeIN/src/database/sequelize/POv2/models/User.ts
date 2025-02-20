import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
   timestamps: true,
   tableName: "users",
   modelName: "POv2User",
   underscored: true
})
class User extends Model {
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({
      type: DataType.STRING(100),
   })
   declare firstName: string;
}

export default User;