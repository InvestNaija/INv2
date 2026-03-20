/* eslint-disable @typescript-eslint/no-explicit-any */
import * as grpc from '@grpc/grpc-js';
import { Exception, ProtoLoader } from '@inv2/common';
import type * as PaymentDefs from '@inv2/common/build/grpc/interfaces/payment'; // ts-proto generated module (types only)
import { injectable } from 'inversify';

export type PaymentClient = grpc.Client & {
   InitializePayment(
      req: PaymentDefs.PaymentRequest,
      cb: (err: grpc.ServiceError | null, res?: PaymentDefs.PaymentResponse) => void
   ): grpc.ClientUnaryCall;
};

@injectable()
export class GrpcClient {

   constructor() {}

   public static async start(): Promise<PaymentClient> {
      // Load all proto services
      const financeProto = ProtoLoader.loadProto('payment.proto');
      const paymentPkg = ((financeProto as grpc.GrpcObject).finance as any).payment;
      const ClientCtor = (paymentPkg as any).PaymentService as typeof grpc.Client;

      const credentials = grpc.ChannelCredentials.createInsecure();
      const target = process.env.GRPC_FINANCE || process.env.FINANCE_GRPC_TARGET || 'finance-srv:3000';
      const client = new ClientCtor(target, credentials) as PaymentClient;
      
      return client;
   }

   static async initializePayment(client: PaymentClient, req: PaymentDefs.PaymentRequest ): Promise<PaymentDefs.PaymentResponse> {
      return new Promise((resolve, reject) => {
         client.InitializePayment(req, (err, res) => {
            if (err) return reject(new Exception({code: err.code, message: err.details}));
            return resolve(res as PaymentDefs.PaymentResponse);
         });
      });
   }
}