import { Entity, Column, PrimaryGeneratedColumn, OneToMany, } from "typeorm";
import { Model } from "../base-model";
import { TenantUserRole } from "./tenant-user-role.entity";

@Entity({ schema: "public", name: 'tenants' })
export class Tenant extends Model {

   @PrimaryGeneratedColumn('uuid')
   public id!: string;

   @Column({ name: "p_id", type: "uuid" })
   public pId!: string;

   @Column({ length: 255, name: "tenant_type" })
   public tenantType!: string;
   
   @Column()
   public name!: string;
   
   @Column({ length: 20 })
   public code!: string;
   
   @Column({ length: 200, unique: true })
   public email!: string;

   @Column({ length: 20, })
   public phone!: string;
   
   @Column({ name: "is_enabled" })
   public isEnabled!: boolean;
   
   @Column({ name: "is_locked" })
   public isLocked!: boolean;

   @OneToMany(() => TenantUserRole, (tur) => tur.tenant)
   public tenantUserRoles!: TenantUserRole[];

}