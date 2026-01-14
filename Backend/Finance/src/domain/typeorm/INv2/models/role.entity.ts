import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BaseEntity, } from "typeorm";
import { TenantUserRole } from "./tenant-user-role.entity";

@Entity({ schema: "public", name: 'roles' })
export class Role extends BaseEntity {
   
   @PrimaryGeneratedColumn('uuid')
   public id!: string;
   
   @Column({ length: 50, nullable: false })
   public name!: string;
   
   @Column()
   public description!: string;
   
   @OneToMany(() => TenantUserRole, (tur) => tur.role)
   public tenantUserRoles!: TenantUserRole[];
}