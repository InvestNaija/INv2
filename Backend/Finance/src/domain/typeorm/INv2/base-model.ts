import { Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity, } from "typeorm";

@Entity()
export class Model extends BaseEntity {

   @CreateDateColumn({ name: 'created_at', type: "timestamp with time zone"})
   public createdAt!: Date;

   @UpdateDateColumn({ name: 'updated_at', type: "timestamp with time zone"})
   public updatedAt!: Date;

   @DeleteDateColumn({ name: 'deleted_at', type: "timestamp with time zone"})
   public deleteAt!: Date;

}