import { Model, Table, Column, DataType, HasMany, HasOne, BeforeUpdate, BeforeCreate, BeforeFind } from "sequelize-typescript";
// import { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

import { BvnData, TenantUserRole } from "../";
import { DBEnums } from "@inv2/common";

import { PasswordManager } from "../../../../main/_utils/PasswordManager";

@Table({
   timestamps: true,
   tableName: "users",
   underscored: true,
   paranoid: true,
   version: true,
})
// export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
export class User extends Model {
   
   @HasOne(() => BvnData)
   declare bvnData: BvnData;
   @HasMany(() => TenantUserRole)
   declare tenantUserRoles: TenantUserRole[];

   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, defaultValue: 0 })
   declare version: number;
   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({ type: DataType.UUID })
   declare pId: string;

   @Column({ type: DataType.STRING(100), })
   declare firstName: string;

   @Column({ type: DataType.STRING(100), })
   declare middleName: string;

   @Column({ type: DataType.STRING(100), })
   declare lastName: string;
   
   @Column({
      type: DataType.STRING(13),
      unique: true,
   })
   declare bvn: string;
   @Column({
      type: DataType.STRING(13),
      unique: true,
   })
   declare nin: string;
   @Column({
      type: DataType.STRING(200),
      unique: true
   })
   declare email: string;

   @Column({ type: DataType.SMALLINT, })
   get gender(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('gender');
      return DBEnums.UserGender.find(g=>g.code===rawValue);
   }
   set gender(value: number|string) {
      const result = DBEnums?.UserGender?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('gender', result);
   }
   
   @Column({ type: DataType.DATEONLY, })
   declare dob: Date;

   @Column({ type: DataType.STRING(20), unique: true, })
   declare phone: string;
   
   @Column({ type: DataType.STRING(500), })
   declare password: string;

   @Column({ type: DataType.STRING })
   declare uuidToken: string;

   @Column({ type: DataType.STRING(20), unique: true, })
   declare refCode: string;

   @Column({ type: DataType.STRING(20), })
   declare referrer: string;
   
   @Column({ type: DataType.BOOLEAN, defaultValue: true })
   declare showBalance: boolean;
   
   @Column({ type: DataType.STRING(100), })
   declare mothersMaidenName: string;
   
   @Column({ type: DataType.STRING(100), })
   declare placeOfBirth: string;
   
   @Column({ type: DataType.BOOLEAN, })
   declare isEnabled: boolean;
   
   @Column({ type: DataType.BOOLEAN, })
   declare isLocked: boolean;
   
   @Column({ type: DataType.BOOLEAN, })
   declare firstLogin: boolean;
   
   @Column({ type: DataType.BOOLEAN, defaultValue: false })
   declare twoFactorAuth: boolean;
   
   @BeforeFind
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   static async beforeReturn(options: any) {
      options?.attributes?.push('version');
   }
   @BeforeUpdate
   @BeforeCreate
   static async changes(instance: User) {
      if(instance.changed('password')) {
         const hashed = await PasswordManager.toHash(instance.password);
         instance.password = hashed;
      }
      if(instance.isNewRecord) { 
         instance.version = 0;
      }
   }
}

// export default {User};