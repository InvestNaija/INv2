import { Entity, Column, } from "typeorm";
import { Model } from "../base-model";

@Entity({ schema: "public", name: 'users' })
export class User extends Model {

   @Column({ type: "uuid", name: "p_id" })
   declare pId: string;
   @Column({ type: "text" })
   declare details: string;
   @Column({ type: "text", name: "tenant_roles" })
   declare tenantRoles: string;

   // /**
   // * Should hold a stringified list of other user data
   // */
   // @Column({type: "text",})
   // get details(): string {
   //    return JSON.parse(this.getDataValue('details'));
   // }  
   // set details(value: string) {
   //    this.setDataValue('details', JSON.stringify(value));
   // }
   // /**
   // * Should hold an array of tenant and roles a user has in tenants
   // * [{id: 123, name: "Cool tenant", roles: [{id: 1, name: "user"}]}]
   // */
   // @Column({ type: "text", })
   // get tenantRoles(): string {
   //    return JSON.parse(this.getDataValue('tenantRoles'));
   // }  
   // set tenantRoles(value: string) {
   //    this.setDataValue('tenantRoles', JSON.stringify(value));
   // }
}