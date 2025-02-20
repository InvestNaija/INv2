import { Model, Table, Column, DataType, BeforeUpdate, BeforeCreate, } from "sequelize-typescript";
import { DBEnums as InvestINDBEnums } from "../../../DBEnums";

@Table({
   timestamps: true,
   tableName: "assets",
   underscored: true,
   paranoid: true,
})
export class Asset extends Model {
   
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
   
   @Column({ type: DataType.STRING(30) })
   declare name: string;
   
   @Column({ type: DataType.SMALLINT, })
   get category(): { code: number; name: string; label: string; } | undefined {
      const rawValue = this.getDataValue('category');
      return InvestINDBEnums.AssetCategory.find(g=>g.code===rawValue);
   }
   set category(value: number|string) {
      const result = InvestINDBEnums?.AssetCategory?.find(g=>(g.code==value || g.label==value || g.name==value))?.code;
      this.setDataValue('category', result);
   }

   @Column({ type: DataType.STRING, })
   declare assetCode: string;                // Should be thesame as external_identifier
   @Column({ type: DataType.STRING, })
   declare description: string;
   @Column({ type: DataType.STRING(3), })
   declare currency: string;
   @Column({ type: DataType.DECIMAL, })
   declare price: number;                    // Formerly sharePrice
   @Column({ type: DataType.DECIMAL, })
   declare yield: number;

   @Column({ type: DataType.STRING(150), })
   declare categoryRange: string;

   @Column({ type: DataType.DATE, })
   declare openingDate: Date;
   @Column({ type: DataType.DATE, })
   declare closingDate: Date;
   @Column({ type: DataType.DATE, })
   declare allocationDate: Date;
   @Column({ type: DataType.DATE, })
   declare fundingDate: Date;
   @Column({ type: DataType.DATE, })
   declare maturityDate: Date;

   @Column({ type: DataType.BIGINT, })
   declare minPricePayable: number;          // Formerly anticipatedMinPrice
   @Column({ type: DataType.DECIMAL, })
   declare maxPricePayable: number;          // Formerly anticipatedMaxPrice
   @Column({ type: DataType.DECIMAL, })
   declare unitsAvailableForSale: number;    // Formerly availableShares
   @Column({ type: DataType.DECIMAL, })
   declare minUnitsBuyable: number;          // Formerly minimumNoOfUnits
   @Column({ type: DataType.DECIMAL, })
   declare maxUnitsBuyable: number;
   @Column({ type: DataType.DECIMAL, })      // Formerly subsequentMultipleUnit
   declare subsequentMultiplesPrice: number;
   @Column({ type: DataType.DECIMAL, })
   declare subsequentMultiplesUnit: number;  // Formerly subsequentMinAmount

   @BeforeUpdate
   @BeforeCreate
   static async changes(instance: Asset) {
      if(instance.isNewRecord) { 
         instance.version = 0;
      } else {
         instance.version++;
      }
   }
}