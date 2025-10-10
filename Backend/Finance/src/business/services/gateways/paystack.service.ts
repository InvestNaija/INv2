import { injectable } from "inversify";
import { GatewayParams, InitParams, VerifyParams } from "./types";

@injectable()
export class PaystackService {
   private headers: Record<string, string>;

   // Paystack service implementation
   constructor( gp: GatewayParams ) {
      this.headers = {
         Authorization: `Bearer ${gp.businessSecret || process.env.PAYSTACK_SECRETKEY}`,
         'Content-Type': 'application/json',
      };
   }
   async init(data: InitParams) {
      console.log(data);
   }
   async verify(verifyParams: VerifyParams) {
      console.log(verifyParams);
   }
   async callback(req: unknown) {
      console.log(req);
   }
}
