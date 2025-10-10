export interface GatewayParams {
   businessSecret?: string;
   subaccountId?: string;
   channels?: string[];
}
interface User {
  email?: string;
}
export interface InitParams {
   user: User;
   amount: number;
   currency: string;
   reference: string;
   callbackUrl?: string;
   metadata?: Record<string, unknown>;
}
export interface VerifyParams {
   query?: Record<string, unknown>;
   params?: Record<string, unknown>;
   body?: Record<string, unknown>;
}