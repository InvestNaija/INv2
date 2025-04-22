import { Entity, Column, BeforeInsert, BeforeUpdate, AfterLoad, PrimaryGeneratedColumn, OneToMany, OneToOne, } from "typeorm";
import { Model } from "../base-model";

import { PasswordManager } from "../../../../_utils/PasswordManager";
import { TenantUserRole } from "./tenant-user-role.entity";
import { BvnData } from "./bvn-data.entity";
@Entity({ schema: "public", name: 'users' })
export class User extends Model {

   @PrimaryGeneratedColumn('uuid')
   public id!: string;

   @Column({ type: "uuid", name: "p_id", })
   public pId!: string;

   @Column({ length: 100, name: "first_name", nullable: true })
   public firstName!: string;

   @Column({ length: 100, name: "middle_name", nullable: true})
   public middleName!: string;

   @Column({ length: 255, name: "last_name", nullable: true })
   public lastName!: string;
   
   @Column({ length: 13, nullable: true })
   public bvn!: string;
   
   @Column({ length: 13, nullable: true })
   public nin!: string;
   
   @Column({ length: 200, unique: true })
   public email!: string;

   @Column({ length: 20 })
   public gender!: string;

   @Column({ type: "date" })
   public dob!: Date;

   @Column({ type: "varchar", length: 20, unique: true, })
   public phone!: string;
   
   @Column({ type: "varchar", length: 500, })
   public password!: string;

   @Column({ type: "varchar", name: "uuid_token", length: 500, nullable: true })
   public uuidToken!: string;

   @Column({ length: 20, name: "ref_code" })
   public refCode!: string;
   
   @Column({ length: 20 })
   public referrer!: string;

   @Column({ type: "bool", name: "show_balance", default: true })
   public showBalance!: boolean;
   
   @Column({ type: "varchar", name: "mothers_maiden_name", length: 100, })
   public mothersMaidenName!: string;
   
   @Column({ type: "varchar", name: "place_of_birth", length: 100, })
   public placeOfBirth!: string;
   
   @Column({ type: "boolean", name: "is_enabled" })
   public isEnabled!: boolean;
   
   @Column({ type: "boolean", name: "is_locked" })
   public isLocked!: boolean;
   
   @Column({ type: "boolean", name: "first_login", })
   public firstLogin!: boolean;
   
   @Column({ type: "boolean", name: "two_factor_auth", default: false })
   public twoFactorAuth!: boolean;
   
   @OneToOne(() => BvnData, (bd) => bd.user)
   public bvnData!: BvnData;
   @OneToMany(() => TenantUserRole, (tur) => tur.user)
   public tenantUserRoles!: TenantUserRole[];

   private tempPassword!: string;   
   @AfterLoad()
   storeOriginalPassword() {
      this.tempPassword = this.password;
   }

   @BeforeInsert()
   @BeforeUpdate()
   async changes(instance: User) {
      if (this.password && this.password !== this.tempPassword) {
         this.password =  await PasswordManager.toHash(instance.password);
      }
      // if(instance.isNewRecord) { 
      //    instance.version = 0;
      // }
   }
}