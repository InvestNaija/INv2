import { Model, Table, Column, DataType, HasMany, } from "sequelize-typescript";
import { Txn } from "..";

@Table({
   timestamps: true,
   tableName: "users",
   underscored: true,
   paranoid: true,
})
export class User extends Model {
   
   @HasMany(() => Txn)
   declare txns: Txn[];

   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, defaultValue: 0 })
   declare version: number;

   /**
    * Should be the Id of the User from the Auth service
    */
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({ type: DataType.UUID })
   declare pId: string;

   /**
   * Should hold a stringified list of other user data
   */
   @Column({type: DataType.TEXT,})
   get details(): string {
      return JSON.parse(this.getDataValue('details'));
   }  
   set details(value: string) {
      this.setDataValue('details', JSON.stringify(value));
   }
   /**
   * Should hold an array of tenant and roles a user has in tenants
   * [{id: 123, name: "Cool tenant", roles: [{id: 1, name: "user"}]}]
   */
   @Column({ type: DataType.TEXT, })
   get tenantRoles(): string {
      return JSON.parse(this.getDataValue('tenantRoles'));
   }  
   set tenantRoles(value: string) {
      this.setDataValue('tenantRoles', JSON.stringify(value));
   }

}
