import { Model, Table, Column, DataType, AfterFind, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { DBEnums } from "@inv2/common";
import { User } from "..";

// const uppercaseFirst = str => `${str[0].toUpperCase()}${str.substr(1)}`;

@Table({
   timestamps: true,
   tableName: "media",
   underscored: true,
   paranoid: true,
})
export class Media extends Model {
   @BelongsTo(() => User, { foreignKey: 'commonId', constraints: false })
   declare user: User;
   
   @Column({ type: DataType.DATE, })
   declare createdAt: Date;
   @Column({ type: DataType.DATE, })
   declare updatedAt: Date;
   @Column({ type: DataType.DATE, })
   declare deletedAt: Date;
   @Column({ type: DataType.INTEGER, })
   declare version: number;

   @Column({
      primaryKey: true,
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
   })
   declare id: string;

   @Column({ type: DataType.STRING(100) })
   @ForeignKey(() => User)
   declare commonId: string;
   @Column({ type: DataType.STRING(100), })
   declare commonType: string;
   @Column({ type: DataType.STRING(100), })
   declare name: string;

   @Column({ type: DataType.SMALLINT, })
   get type(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('type');
      return DBEnums.MediaType.find(g=>g.code===rawValue);
   }
   set type(value: number|string) {
      const result = DBEnums?.MediaType?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('type', result);
   }
   
   @Column({ type: DataType.STRING(100), })
   declare mime: string;
   
   @Column({ type: DataType.INTEGER, })
   declare size: number;
   
   @Column({ type: DataType.TEXT, })
   declare resource: string;

   // getCommon(options: any) {
   //    if (!this.commonType) return Promise.resolve(null);
   //    const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
   //    return this[mixinMethodName](options);
   // }
   @AfterFind
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   static async runAfterFind(findResult: any[]) {
      if (!Array.isArray(findResult)) findResult = [findResult];
      for (const instance of findResult) {
         if (instance.commonType === 'users' && instance.users !== undefined) {
            instance.common = instance.users;
         } else if (instance.commonType === "txn_headers" && instance.txn_headers !== undefined) {
            instance.common = instance.txn_headers;
         }
         
         // if(instance?.dataValues?.response) {
         //    let data = null;
         //    try {
         //       data = JSON.parse(instance?.dataValues?.response);
         //       const uploaderService = new CloudObjUploadService({service: data.service});
         //       const uploaded = await uploaderService.getFile(data);
         //       instance.setDataValue('response', uploaded.data);
         //    } catch (error) {
         //       // img = this.getDataValue('image')
         //    }
         // }
         // delete to prevent duplicates
         delete instance.users;
         delete instance.dataValues.users;
         delete instance.txn_headers;
         delete instance.dataValues.txn_headers;
      }
   }
}

// export default {User};