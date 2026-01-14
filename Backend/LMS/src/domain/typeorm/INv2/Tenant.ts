import { Entity, Column, } from "typeorm";
import { Model } from "../Model";

@Entity({ name: 'tenants' })
export class Tenant extends Model {

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

}