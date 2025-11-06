import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IPaymentFactory } from "./gateways/ipayment.factory";
import { PaymentGateway } from "./gateways/payment-gateway.enum";
import { TransactionService } from "./transaction.service";
import { Txn } from "~base/domain/sequelize/INv2";
import { Exception, Helper, IResponse, UserDto } from "@inv2/common";

@injectable()
export class PaymentService {
   constructor(
      @inject(TYPES.PaymentFactory) 
      private factory: IPaymentFactory,
      @inject(TYPES.TransactionService) 
      private readonly txnSvc: TransactionService,
   ) {}

   async initializePayment(user: UserDto, gateway: PaymentGateway, body: Txn): Promise<IResponse> {
      /**
       * TODO: First save it to the DB with a PENDING status
       */
      // let { amount, currency, description, reference, source, type, gateway_params, payment_type, saved_card_id, direct_debit_id, gateway, redirect_url, callback_params, updateTxn, post_date } = req.body;
      body.reference = body.reference ?? Helper.genRandomCode(20, { includeNumbers: true, includeUpperChars: true, includeLowerChars: false, includeSpecialChars: false, });
      const {reference, amount, currency, ...callbackParams} = body;
      console.log("reference, amount, currency =>",reference, amount, currency);
      
      body.callbackParams = JSON.stringify(callbackParams || {});
      body.userId = user.id;
      await this.txnSvc.createTxn(body);
      
      const data = { ...body, user};
      const channel = this.factory.createGateway(gateway, { apiKey: process.env.PAYSTACK_SECRET_KEY || "",});
      const init = await channel.initializePayment(data);
      if(!init.success) 
         throw new Exception(init);
      return init;
   }
}

