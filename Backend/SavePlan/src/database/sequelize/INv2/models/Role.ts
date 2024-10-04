import { Table, Column, DataType, Model, HasMany } from "sequelize-typescript";
import { TenantUserRole } from "../";

@Table({
   paranoid: false,
   timestamps: false,
   tableName: "roles",
   underscored: true
})
export class Role extends Model {

   @HasMany(() => TenantUserRole)
   declare tenantUserRoles: TenantUserRole[];
   
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;
   
   @Column({
      type: DataType.STRING,
      allowNull: false,
      unique: true
   })
   declare name: string;
   
   @Column({
      type: DataType.STRING,
      allowNull: false,
   })
   declare description: string;
}