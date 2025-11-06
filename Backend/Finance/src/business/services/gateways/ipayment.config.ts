export interface IPaymentConfig {
   apiKey: string;
   baseUrl?: string;
   merchantId?: string;
   additionalParams?: Record<string, string | number | boolean | object>;
}
