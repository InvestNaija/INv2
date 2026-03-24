import { inject, injectable } from "inversify";
import moment from "moment";
import { INLogger, IResponse, DBEnums, Exception, UserTenantRoleDto, handleError, Helper } from "@inv2/common";
import { SavePlan, SavePlanPmtTxn } from "../../domain/sequelize/INv2";
import { SaveplanDto, SaveplanCreateDto } from "../../_dtos";
import { ISavePlanRepository } from "../repositories";
import { TYPES } from "../types";
import { Calculator } from "./calculator.service";
import { GrpcClient } from "../../grpc/client";
import { CommonService } from "./common.service";

@injectable()
export class CustomerSaveplanService {

   constructor(
      @inject(TYPES.ISavePlanRepository) 
      private readonly saveplanRepo: ISavePlanRepository,
   ){}
   async list(type: string|number): Promise<IResponse> {
      // try {
      const saveplans = await SavePlan.findAndCountAll({
         attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
         where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
      });
      return { success: true, code: 200, message: `SavePlans retrieved successfully`, count: saveplans.count, data: saveplans.rows };
      // } catch (error) {
      //    throw new Exception(handleError(error));
      // }
   }
   /**
    * Creates a new SavePlan subscription for a customer.
    * 
    * This method performs several steps:
    * 1. Validates the existence of the base SavePlan product.
    * 2. Calculates the end date based on the provided duration or a custom end date.
    * 3. Uses the Calculator utility to project financial metrics (PMT, future value, interest).
    * 4. Persists the subscription details to the SavePlanUser table.
    * 
    * @param currentUser The authenticated user initiate the request
    * @param body The payload containing specific plan parameters (productId, amount, duration, frequency, etc.)
    * @returns A promise resolving to an IResponse object
    */
   async create(currentUser: UserTenantRoleDto, body: SaveplanCreateDto): Promise<IResponse> {
      try {
         // 1. Fetch the base SavePlan product to get defaults (interest rate, calculator type, etc.)
         const product: SavePlan|null = await SavePlan.findByPk(body.productId);
         if(!product) throw new Exception({code: 404, message: `SavePlan product not found`});
         
         const createdPlan = await CommonService.subscribeIntoPlan(product, currentUser, body);
         const { calculations, initialAmt, startDate, lockedInPlan } = createdPlan.data;

         // 5. Handle Initial Transaction (If applicable)
         // If the plan starts today, we create a pending transaction record and initiate the payment process via gRPC.
         let authorizationUrl: string | undefined;
         if (startDate.isSame(moment(), 'day')) {
            const transactionReference = Helper.genRandomCode(20, { includeSpecialChars: false, includeLowerChars: false });
            const amountToPay = initialAmt > 0 ? initialAmt : calculations.PMT;

            // Call Finance gRPC to initialize the payment
            try {
               const client = await GrpcClient.start();
               const paymentResponse = await GrpcClient.initializePayment(client, {
                  amount: amountToPay, 
                  currency: product.currency?.name || 'NGN',
                  description: lockedInPlan.description,
                  user_id: currentUser.user.id,
                  module: 'SavePlan',
                  module_id: lockedInPlan.id,
                  gateway: body.gateway,
                  reference: transactionReference,
                  callbackParams: body.callbackParams
               } as any);

               if (paymentResponse.success && paymentResponse.data?.authorizationUrl) {
                  authorizationUrl = paymentResponse.data.authorizationUrl;
                  INLogger.log.info(`Payment initialized for SavePlan ${lockedInPlan.id}. Authorization URL: ${authorizationUrl}`);
               }
            } catch (grpcError: any) {
               INLogger.log.error(`Failed to initialize payment for SavePlan ${lockedInPlan.id}: ${grpcError.message}`);
               // We continue despite the payment error, the plan is still created but payment remains pending
            }
            
            await SavePlanPmtTxn.create({
               saveplanUserId: lockedInPlan.id,
               amount: amountToPay,
               reference: transactionReference,
               status: 'pending',
               description: lockedInPlan.description,
               type: 'credit', // Initial funding is a credit to the plan
               postDate: new Date(),
            });

            INLogger.log.info(`Initial transaction created for SavePlan ${lockedInPlan.id} with reference ${transactionReference}`);
         }

         INLogger.log.info(`New SavePlan subscription created for user ${currentUser.user.id} => ${lockedInPlan.id}`);

         return { 
            success: true, 
            code: 201, 
            message: `SavePlan '${lockedInPlan.title}' created successfully`, 
            data: {
               plan: lockedInPlan,
               calculations: calculations,
               authorizationUrl
            }
         };
      } catch (error) {
         // Standardize error handling using the common utility
         throw new Exception(handleError(error));
      }
   }
}