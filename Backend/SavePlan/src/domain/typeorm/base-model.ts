import { Entity, PrimaryColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity, Column, } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity()
export class Model extends BaseEntity {
   @PrimaryColumn({ type: 'uuid'})
   public id!: string;

   @CreateDateColumn({ name: 'created_at', type: "timestamp with time zone"})
   public createdAt!: Date;

   @UpdateDateColumn({ name: 'updated_at', type: "timestamp with time zone"})
   public updatedAt!: Date;

   @DeleteDateColumn({ name: 'deleted_at', type: "timestamp with time zone"})
   public deleteAt!: Date;

   @Column({ type: "bigint", default: 0 })
   declare version: number;

   @BeforeInsert() 
   generate() { 
      this.id=uuidv4();
   }
}