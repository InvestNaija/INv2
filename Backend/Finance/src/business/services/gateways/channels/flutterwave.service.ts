/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { IPaymentService } from "../ipayment.service";
import { IPaymentConfig } from "../ipayment.config";
import { InitParams } from "../../../../business/types";

export class FlutterwaveService implements IPaymentService {
   private merchantSecret: string;
   private baseUrl: string;
   private headers: Record<string, string>;

   constructor(config: IPaymentConfig) {
      this.merchantSecret = config.apiKey;
      this.baseUrl = config.baseUrl || "https://api.flutterwave.com/v3";
      this.headers = {
         Authorization: `Bearer ${this.merchantSecret || process.env.PAYSTACK_SECRETKEY}`,
         'Content-Type': 'application/json',
      };
   }

   async initializePayment(body: InitParams, metadata = {application: 'IN'}): Promise<any> {
      console.log(`🚀 [Flutterwave] Initializing for ${body.user.email}...`);
      try {
         const data = {
            amount: body.amount, 
            redirect_url: body.callbackUrl, 
            payment_options: 'card', 
            currency: "NGN", 
            tx_ref: body.reference, 
            customer: {
               email: body.user.email,
               phonenumber: body.user.phone,
               name: body.user.firstName + ' ' + body.user.lastName,
            },
            customizations: {
               title: "InvestNaija",
               description: "InvestNaija",
               logo: process.env.BACKEND_BASE + "/emailTemplates/assets/logo.png"
            },
            meta: {
               ...metadata,
               redirect_url: body.callbackUrl
            },
         };
         // if (gateway_params.subaccountId) {
         //    data.subaccounts = [{
         //       id: gateway_params.subaccountId,
         //    }]
         // }
         
         const payload = JSON.stringify(data);
         const response = await axios.request({
            url: 'https://api.flutterwave.com/v3/payments',
            method: 'POST',
            headers: this.headers,
            data: payload
         });
         
         if (response.data.data && response.data.data.link) {
            return {success: true, status: response.status, data: response.data.data, message: response.data.message};
         } else {
            throw Error('Error generating payment link');
         }
      } catch (err: any) {
         throw new Error(`Flutterwave init failed: ${err.message}`);
      }
   }
   async verify(data: { query: any; params: any; body: any; }): Promise<any> {
      console.log(`🚀 [Flutterwave] Verifying payment...`);
      try {
         const { reference } = data.query;
         if (!reference) throw new Error('Transaction ID is required');

         const response = await axios.request({
            method: 'GET',
            url: `${this.baseUrl}/transactions/${reference}/verify`,
            headers: this.headers,
         });
         return response.data;
      } catch (err: any) {
         throw new Error(`Flutterwave verify failed: ${err.message}`);
      }
   }
}
