import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IOrderRepository } from "../repositories/iorder.repository";
import { IOfferingRepository } from "../repositories/ioffering.repository";
import { GrpcClient } from "../../grpc/client";
import { Exception } from "@inv2/common";

@injectable()
export class OrderService {
   constructor(
      @inject(TYPES.IOrderRepository) private readonly orderRepo: IOrderRepository,
      @inject(TYPES.IOfferingRepository) private readonly offeringRepo: IOfferingRepository
   ) {}

   async createOrder(userId: string, offeringId: string, units: number, gateway: string): Promise<any> {
      const offering = await this.offeringRepo.findById(offeringId);
      if (!offering) throw new Exception({ code: 404, message: 'Offering not found' });
      
      const now = new Date();
      if (now < offering.openingDate || now > offering.closingDate) {
         throw new Exception({ code: 400, message: 'Offering is currently not active for purchase' });
      }
      
      if (units < offering.minimumUnitsToPurchase) {
         throw new Exception({ code: 400, message: `Minimum units to purchase is ${offering.minimumUnitsToPurchase}` });
      }
      
      const totalAmount = units * offering.offerPrice;
      
      const order = await this.orderRepo.create({
         userId,
         offeringId,
         units,
         totalAmount,
         status: 'PENDING'
      });
      
      // Call Finance gRPC
      try {
         const client = await GrpcClient.start();
         const paymentResponse = await GrpcClient.initializePayment(client, {
            amount: totalAmount,
            currency: offering.currency,
            description: `Purchase of ${units} units of ${offering.name}`,
            user_id: userId,
            module: 'PO',
            module_id: order.id,
            gateway: gateway
         } as any);
         
         if (paymentResponse.success && paymentResponse.data?.authorizationUrl) {
            await this.orderRepo.updateStatus(order.id, 'PENDING', paymentResponse.data.authorizationUrl);
            return {
               orderId: order.id,
               authorizationUrl: paymentResponse.data.authorizationUrl
            };
         } else {
            await this.orderRepo.updateStatus(order.id, 'FAILED');
            throw new Exception({ code: 500, message: 'Payment gateway initialization failed' });
         }
      } catch (error: any) {
         await this.orderRepo.updateStatus(order.id, 'FAILED');
         throw new Exception({ code: 500, message: `Finance service error: ${error.message}` });
      }
   }
}
