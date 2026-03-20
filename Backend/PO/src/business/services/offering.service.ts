import { inject, injectable } from "inversify";
import { Exception } from "@inv2/common";
import { TYPES } from "../types";
import { IOfferingRepository } from "../repositories/ioffering.repository";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
import { OfferingCreatedPublisher } from "../../events/publishers/offering-created.publisher";
import { OfferingUpdatedPublisher } from "../../events/publishers/offering-updated.publisher";
import { Offering } from "../../domain/sequelize/INv2/models/offering.model";

@injectable()
export class OfferingService {
   constructor(
      @inject(TYPES.IOfferingRepository) private readonly offeringRepo: IOfferingRepository
   ) {}

   async createOffering(data: Partial<Offering>): Promise<Offering> {
      const offering = await this.offeringRepo.create(data);
      await new OfferingCreatedPublisher(rabbitmqWrapper.connection).publish({
         id: offering.id,
         name: offering.name,
         offerPrice: offering.offerPrice,
         currency: offering.currency
      } as any);
      return offering;
   }

   async getAvailableOfferings(): Promise<Offering[]> {
      return await this.offeringRepo.findAllActive();
   }

   async getOfferingById(id: string): Promise<Offering | null> {
      return await this.offeringRepo.findById(id);
   }

   async updateOffering(id: string, data: Partial<Offering>): Promise<Offering> {
      const offering = await this.offeringRepo.findById(id);
      if (!offering) throw new Exception({ code: 404, message: 'Offering not found' });
      
      const [affectedCount, updatedOfferings] = await this.offeringRepo.update(id, data);
      const updatedOffering = updatedOfferings[0];
      await new OfferingUpdatedPublisher(rabbitmqWrapper.connection).publish({
         id: updatedOffering.id,
         name: updatedOffering.name,
         offerPrice: updatedOffering.offerPrice,
         currency: updatedOffering.currency
      } as any);
      return updatedOffering;
   }
}
