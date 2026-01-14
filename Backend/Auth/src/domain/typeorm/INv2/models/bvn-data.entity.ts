import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "..";
import { Model } from "../base-model";

@Entity({
   name: "bvn_data",
   schema: "public",
})
export class BvnData extends Model {
   
   @PrimaryGeneratedColumn('uuid')
   public id!: string;

   @OneToOne(() => User, (user) => user.bvnData)
   @JoinColumn ({ name: "user_id", referencedColumnName: "id" })
   declare user: User;


   @Column({
      type: "varchar",
      length: 13,
      name: "bvn",
      unique: true,
   })
   declare bvn: string;
   
   @Column({ type: "boolean" })
   declare isVerified: boolean;
   
   @Column({type: "text",})
   declare bvnResponse: string ;
}