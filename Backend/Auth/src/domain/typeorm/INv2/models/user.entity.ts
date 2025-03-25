import { Entity, Column, } from "typeorm";
import { Model } from "../base-model";

@Entity({ schema: "public", name: 'users' })
export class User extends Model {

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

   @Column({ length: 20, name: "ref_code" })
   public refCode!: string;
   
   @Column({ length: 20 })
   public referrer!: string;
   
   @Column({ length: 20 })
   public gender!: string;
   
   @Column({ type: "date" })
   public dob!: Date;
}