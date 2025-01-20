import { Entity, Column, PrimaryColumn, BeforeInsert, BaseEntity, } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity({ schema: "public", name: 'users' })
export class Role extends BaseEntity {
   
   @PrimaryColumn({ type: 'uuid'})
   public id!: string;
   
   @Column({ length: 50, nullable: false })
   public name!: string;
   
   @Column()
   public description!: string;
   
   @BeforeInsert() 
   genarate() { 
      this.id=uuidv4();
   }
}