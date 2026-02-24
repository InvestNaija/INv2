import { Entity, Column, } from "typeorm";
import { Model } from "../Model";

@Entity({ schema: "public", name: 'users' })
export class User extends Model {

   @Column({ length: 100, name: "first_name" })
   public firstName!: string;

   @Column({ length: 100, name: "middle_name"})
   public middleName!: string;

   @Column({ length: 255, name: "last_name" })
   public lastName!: string;
   
   @Column({ length: 13 })
   public bvn!: string;
   
   @Column({ length: 13 })
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