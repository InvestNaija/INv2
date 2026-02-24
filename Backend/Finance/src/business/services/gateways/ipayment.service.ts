import { InitParams } from "../../../business/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RequestData {
   query: any; // Use actual types here
   params: any;
   body: any;
}

export interface IPaymentService {
   initializePayment(data: InitParams, metadata?: Record<string, any>): Promise<any>;
   verify(data: RequestData): Promise<any>;
}