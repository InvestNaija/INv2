import { injectable } from "inversify";
import { Op } from "sequelize";
import { IOfferingRepository } from "../../ioffering.repository";
import { Offering } from "../../../../domain/sequelize/INv2/models/offering.model";

@injectable()
export class OfferingRepository implements IOfferingRepository {
   async create(data: Partial<Offering>): Promise<Offering> {
      return await Offering.create(data as any);
   }

   async findById(id: string): Promise<Offering | null> {
      return await Offering.findByPk(id);
   }

   async findAllActive(): Promise<Offering[]> {
      const now = new Date();
      return await Offering.findAll({
         where: {
            openingDate: { [Op.lte]: now },
            closingDate: { [Op.gte]: now }
         }
      });
   }

   async update(id: string, data: Partial<Offering>): Promise<[number, Offering[]]> {
      return await Offering.update(data, { where: { id }, returning: true });
   }
}
