import { IPaymentService } from "./ipayment.service";
import { PaymentGateway } from "./payment-gateway.enum";
import { IPaymentConfig } from "./ipayment.config";

export interface IPaymentFactory {
   createGateway(gateway: PaymentGateway, config: IPaymentConfig): IPaymentService;
}
