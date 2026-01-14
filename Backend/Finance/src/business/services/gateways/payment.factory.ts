import { injectable } from "inversify";
import { IPaymentFactory } from "./ipayment.factory";
import { IPaymentService } from "./ipayment.service";
import { IPaymentConfig } from "./ipayment.config";
import { PaymentGateway } from "./payment-gateway.enum";
import { PaystackService } from "./channels/paystack.service";
import { FlutterwaveService } from "./channels/flutterwave.service";

@injectable()
export class PaymentFactory implements IPaymentFactory {
   createGateway(gateway: PaymentGateway, config: IPaymentConfig): IPaymentService {
      switch (gateway) {
      case PaymentGateway.PAYSTACK:
         return new PaystackService(config);
      case PaymentGateway.FLUTTERWAVE:
         return new FlutterwaveService(config);
      default:
         throw new Error(`Unsupported payment gateway: ${gateway}`);
      }
   }
}
