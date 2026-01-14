import { Entity, Column, } from "typeorm";
import { Model } from "../base-model";

@Entity({ schema: "public", name: 'users' })
export class User extends Model {

   @Column({ length: 100, nullable: true })
   public title!: string;

   @Column({ length: 100, nullable: true})
   public type!: string;

   @Column({ length: 255, nullable: true })
   public calculator!: string;
   
   @Column({ length: 13, nullable: true })
   public currency!: string;
   
   /** A short summary that can be displayed on the UI*/
   @Column({ length: 1000, nullable: true  })
   declare summary: string;
   /** A short summary that can be displayed on the UI*/
   @Column({ type: "text", })
   declare description: string;
   /** Interest for this saveplan */
   @Column({ name: 'interest_rate', type: "decimal", precision: 10, scale: 2, })
   declare interestRate: number;
   /** Interest for this saveplan */
   @Column({ name: 'min_duration', type: "decimal", precision: 10, scale: 2, })
   declare minDuration: number;
   @Column({ name: 'max_duration', type: "decimal", precision: 10, scale: 2, })
   declare maxDuration: number;
   @Column({ name: 'min_amount', type: "decimal", precision: 10, scale: 2, })
   declare minAmount: number;
   @Column({ name: 'max_amount', type: "decimal", precision: 10, scale: 2, })
   declare maxAmount: number;
}