
// file types.ts
export const TYPES = {
   PaymentFactory: Symbol.for("PaymentFactory"),
   IUserRepository: Symbol.for("IUserRepository"),
   UserRepository: Symbol.for("UserRepository"),
   ITxnRepository: Symbol.for("ITxnRepository"),
   TxnRepository: Symbol.for("TxnRepository"),
   TransactionService: Symbol.for("TransactionService"),
   PaymentService: Symbol.for("PaymentService"),
   GrpcServer: Symbol.for('GrpcServer'),
   GPCPaymentService: Symbol.for("GPCPaymentService"),
};
export interface GatewayParams {
   businessSecret?: string;
   subaccountId?: string;
   channels?: string[];
}
interface User {
   email?: string;
   phone?: string;
   firstName?: string;
   lastName?: string;
}
export interface InitParams {
   user: Partial<User>;
   amount: number;
   currency: string;
   reference: string;
   channels?: string[];
   callbackUrl?: string;
   subaccountId?: string;
   metadata?: Record<string, unknown>;
}
export interface VerifyParams {
   query?: Record<string, unknown>;
   params?: Record<string, unknown>;
   body?: Record<string, unknown>;
}