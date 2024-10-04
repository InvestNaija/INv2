import { Table, Column, DataType, Model, IsEmail, HasMany } from "sequelize-typescript";
import { DBEnums } from "@inv2/common";
import { TenantUserRole } from "../";

@Table({
   paranoid: true,
   timestamps: true,
   tableName: "tenants",
   underscored: true,
})
export class Tenant extends Model {
   
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;
   
   @Column({
      type: DataType.UUID,
   })
   declare pId: string;

   @IsEmail
   @Column({
      type: DataType.STRING,
   })
   declare name: string;

   @Column({ type: DataType.SMALLINT, })
   get tenantType(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('tenantType');
      return DBEnums.TenantType.find(g=>g.code===rawValue);
   }
   set tenantType(value: number|string) {
      const result = DBEnums?.TenantType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('tenantType', result);
   }
   
   @Column({
      type: DataType.STRING,
   })
   declare code: string;
   
   @Column({
      type: DataType.STRING(200),
   })
   declare email: string;
   
   @Column({
      type: DataType.STRING(20),
   })
   declare phone: string;
   
   @Column({
      type: DataType.BOOLEAN,
      defaultValue: true
   })
   declare isEnabled: string;
   
   @Column({
      type: DataType.BOOLEAN,
      defaultValue: true
   })
   declare isLocked: string;

   
   @HasMany(() => TenantUserRole)
   declare tenantUserRoles: TenantUserRole[];
}