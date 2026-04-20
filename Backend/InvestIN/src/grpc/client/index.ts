/* eslint-disable @typescript-eslint/no-explicit-any */
import * as grpc from '@grpc/grpc-js';
import { Exception, ProtoLoader } from '@inv2/common';
import type * as PaymentDefs from '@inv2/common/build/grpc/interfaces/payment';
import { injectable } from 'inversify';

export type PaymentClient = grpc.Client & {
   InitializePayment(
      req: PaymentDefs.PaymentRequest,
      cb: (err: grpc.ServiceError | null, res?: PaymentDefs.PaymentResponse) => void,
   ): grpc.ClientUnaryCall;
};

/**
 * GrpcClient
 * Provides methods to interact with the Finance gRPC microservice.
 */
@injectable()
export class GrpcClient {
   /**
    * Establishes a connection to the Finance microservice.
    */
   public static async start(): Promise<PaymentClient> {
      // Load all proto services
      const financeProto = ProtoLoader.loadProto('payment.proto');
      const paymentPkg = ((financeProto as grpc.GrpcObject).finance as any).payment;
      const ClientCtor = (paymentPkg as any).PaymentService as typeof grpc.Client;

      const credentials = grpc.ChannelCredentials.createInsecure();
      const client = new ClientCtor(process.env.GRPC_FINANCE || 'localhost:50051', credentials) as PaymentClient;

      return client;
   }

   /**
    * Calls the InitializePayment method on the Finance gRPC service.
    * @param client The active PaymentClient.
    * @param req The payment initialization request.
    */
   public static async initializePayment(
      client: PaymentClient,
      req: PaymentDefs.PaymentRequest,
   ): Promise<PaymentDefs.PaymentResponse> {
      return new Promise((resolve, reject) => {
         client.InitializePayment(req, (err, res) => {
            if (err) return reject(new Exception({ code: err.code, message: err.details }));
            return resolve(res as PaymentDefs.PaymentResponse);
         });
      });
   }
}
