/* eslint-disable @typescript-eslint/no-explicit-any */
import { INLogger, UserDto } from '@inv2/common';
import { TYPES } from '../../business/types';
import { PaymentService } from '../../business/services/payment.service';
import { inject, injectable } from 'inversify';

@injectable()
export class GPCPaymentService {
   constructor(
      @inject(TYPES.PaymentService)
      private readonly pmtSvc: PaymentService 

   ){ }

   // Implement your gRPC service methods here
   public InitializePayment = async (call: any, callback: any): Promise<void> => {
      const profiler = INLogger.log.startTimer();
      try {
         // // Your payment processing logic
         const paymentDetails = call.request;
         const user = {id: paymentDetails.user_id, email: 'infinitizon@gmail.com'} as unknown as UserDto;
         const payment = await this.pmtSvc.initializePayment(user, paymentDetails.gateway, paymentDetails);
         profiler.done({service: `Finance`, mxessage: `Payment initialized successful => ${JSON.stringify(payment)}`});
         callback(null, payment);
      } catch (error) {
         INLogger.log.error('ProcessPayment failed', error);
         profiler.done({
            service: 'Finance',
            message: 'Payment processing failed',
         });
         callback(error as any);
      }
   };
}