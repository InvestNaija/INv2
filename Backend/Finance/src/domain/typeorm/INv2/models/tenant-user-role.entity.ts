import { Entity, JoinColumn, ManyToOne, PrimaryColumn,  } from "typeorm";
import { Model } from "../base-model";
import { Tenant, User, Role } from "..";


@Entity({
   schema: "public",
   name: "tenant_user_roles",
})
export class TenantUserRole extends Model {

   /**
    * ! This is a fake attribute
    * This is a workaround for TypeORM's `MissingPrimaryColumnError`
    **/
   @PrimaryColumn({ type: 'uuid', insert: false, select: false, update: false })
   declare id: never;
   
   @ManyToOne(() => Tenant, (tenant) => tenant.tenantUserRoles)
   @JoinColumn({ name: "tenant_id"})
   declare tenant: Tenant;
   
   @ManyToOne(() => User, (user) => user.tenantUserRoles)
   @JoinColumn({ name: "user_id"})
   declare user: User;
   
   @ManyToOne(() => Role, (role) => role.tenantUserRoles)
   @JoinColumn({ name: "role_id"})
   declare role: Role;
}