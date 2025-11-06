/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { IPaymentService } from "../ipayment.service";
import { IPaymentConfig } from "../ipayment.config";
import { IResponse } from "@inv2/common";
import { InitParams } from "../../../../business/types";

export class PaystackService implements IPaymentService {
   private merchantSecret: string;
   private baseUrl: string;
   private headers: Record<string, string>;

   constructor(config: IPaymentConfig) {
      this.merchantSecret = config.apiKey;
      this.baseUrl = config.baseUrl || "https://api.paystack.co";
      this.headers = {
         Authorization: `Bearer ${this.merchantSecret || process.env.PAYSTACK_SECRETKEY}`,
         'Content-Type': 'application/json',
      };
   }

   async initializePayment(body: InitParams, metadata = {application: 'IN'}): Promise<IResponse> {
      console.log(`🚀 [Paystack] Initializing for ${body.user.email}...`);
      try {
         // generate transaction reference
         body.amount = (body.amount * 100).toFixed(2) as unknown as number; // convert to kobo
   
         const data = {
            amount: body.amount, currency: body.currency||'NGN',
            email: body.user.email,
            reference: body.reference,
            metadata
         };
         const payload = JSON.stringify(data);

         const response = await axios.request({
            method: 'POST',
            url: `${this.baseUrl}/transaction/initialize`,
            data: payload,
            headers: this.headers
         });
         if (response.data.data && response.data.data.authorization_url) {
            response.data.status = 'success';
            response.data.data.link = response.data?.data?.authorization_url;
            // return {success: true, status: response.status, data: response.data.data, message: response.data.message};
            return { success: true, code: response.status, show: true, message: response.data.message, data: response.data.data};
         } else {
            throw Error('Error generating payment link');
         }
      } catch (err: any) {
         console.log(`Paystack init failed: ${err.response?.data?.message}`);
         return { success: false, code: 500, show: true, message: err.response?.data?.message};
      }
   }
   async verify(data: { query: any; params: any; body: any; }): Promise<any> {
      console.log(`🚀 [Paystack] Verifying payment...`);
      try {
         const { reference } = data.query;
         if (!reference) throw new Error('Transaction reference is required');

         const response = await axios.request({
            method: 'GET',
            url: `${this.baseUrl}/transaction/verify/${reference}`,
            headers: this.headers
         });
         if (response.data.data && response.data.data.status === 'success') {
            return { success: true, code: response.status, show: true, message: 'Payment verified', data: response.data.data};
         } else {
            return { success: false, code: response.status, show: true, message: 'Payment not successful', data: response.data.data};
         }
      } catch (err: any) {
         console.log(`Paystack init failed: ${err.response?.data?.message}`);
         return { success: false, code: 500, show: true, message: err.response?.data?.message};
      }
   }
}
