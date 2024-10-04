import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Tenant, User, Role } from "../";


@Table({
   paranoid: true,
   timestamps: true,
   tableName: "tenant_user_roles",
   underscored: true
})
export class TenantUserRole extends Model {

   @Column({
      primaryKey: true,
      type: DataType.UUID,
   })
   @ForeignKey(() => Tenant)
   declare tenantId: string;
   @BelongsTo(() => Tenant)
   declare tenant: Tenant;
   
   @Column({
      primaryKey: true,
      type: DataType.UUID,
   })
   @ForeignKey(() => User)
   declare userId: string;
   @BelongsTo(() => User)
   declare user: User;
   
   @Column({
      primaryKey: true,
      type: DataType.UUID,
   })
   @ForeignKey(() => Role)
   declare roleId: string;
   @BelongsTo(() => Role)
   declare role: Role;
}