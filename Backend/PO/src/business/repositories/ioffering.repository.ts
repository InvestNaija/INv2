import { Offering } from "../../domain/sequelize/INv2/models/offering.model";

export interface IOfferingRepository {
   create(data: Partial<Offering>): Promise<Offering>;
   findById(id: string): Promise<Offering | null>;
   findAllActive(): Promise<Offering[]>;
   update(id: string, data: Partial<Offering>): Promise<[number, Offering[]]>;
}
