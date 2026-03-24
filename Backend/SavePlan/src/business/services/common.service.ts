import { INLogger, IResponse, DBEnums, moment, Helper, UserTenantRoleDto, Exception, } from "@inv2/common";
import { SavePlan, SavePlanUser, } from "../../domain/sequelize/INv2";
import { Calculator } from "./calculator.service";
import { SaveplanCreateDto } from "../../_dtos";

export class CommonService {

   async list(type: string|number): Promise<IResponse> {
      // try {
      const saveplans = await SavePlan.findAndCountAll({
         attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
         where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
      });
      INLogger.log.info(`Server running on port`);
      return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
      // } catch (error) {
      //    throw new Exception(handleError(error));
      // }
   }
   async create(type: string|number): Promise<IResponse> {
      // try {
      const saveplans = await SavePlan.findAndCountAll({
         attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
         where: {...(type && {type: DBEnums?.SaveplanType?.find(g=>(g.code==type || g.label==type || g.name==type))?.code})}
      });
      INLogger.log.info(`Server running on port`);
      return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
      // } catch (error) {
      //    throw new Exception(handleError(error));
      // }
   }
   static async subscribeIntoPlan(product: SavePlan, currentUser: UserTenantRoleDto, body: SaveplanCreateDto): Promise<IResponse> {
         // 1. Handle Date Calculations
         // If the user chooses a predefined duration, we add those months to the start date.
         // Otherwise, we use the customEndDate provided by the user.
         let startDate = moment(body.startDate);
         let endDate: moment.Moment;

         if (body.duration === 'choose' || body.custom) {
            if (!body.customEndDate) throw new Exception({code: 400, message: `Custom end date is required for this plan` });
            endDate = moment(body.customEndDate);
         } else {
            const durationMonths = typeof body.duration === 'string' ? parseInt(body.duration) : body.duration;
            endDate = moment(body.startDate).add(durationMonths, 'months');
         }

         // Ensure the end date is after the start date
         if (endDate.isBefore(startDate)) {
            throw new Exception({code: 400, message: `End date must be after start date`});
         }

         // 2. Perform Financial Calculations
         // We use the Calculator helper to determine the PMT (payment), future value, and interest earned.
         // The choice of calculation method depends on the product's calculator type (e.g., 'plan' vs 'compounding').
         let calculations: any;
         const interestRate = Number(product.interestRate);
         const frequency = body.frequency;
         const initialAmt = Number(body.initialAmt || 0);
         const targetAmount = Number(body.amount);

         const calcType = product.calculator?.name?.toLowerCase();

         if (calcType === 'plan' || calcType === 'planin') {
            // "Plan" tells the user how much to save periodically to reach a target future value.
            calculations = Calculator.plan(
               initialAmt,
               targetAmount,
               frequency,
               interestRate,
               startDate.toDate(),
               endDate.toDate()
            );
         } else {
            // "Compounding" (SaveIn) calculates the future value based on recurring payments.
            calculations = Calculator.compounding(
               initialAmt,
               targetAmount, // Here, 'amount' is treated as the PMT (periodic payment)
               frequency,
               interestRate,
               startDate.toDate(),
               endDate.toDate()
            );
         }
         
         const nextBillingDate = moment().format('YYYY-MM-DD') === startDate.format('YYYY-MM-DD')
                    ? Helper.getNextScheduleDate(startDate.toDate(), frequency)
                    : startDate.toDate();
         // 4. Persist the User's SavePlan record
         // We store all projected fields and the current status.
         const lockedInPlan = await SavePlanUser.create({
            saveplanId: product.id,
            userId: currentUser.user.id,
            title: body.custom ? body.title : product.title,
            description: body.custom ? `Custom Plan: ${body.title}` : `Subscription to ${product.title}`,
            pmt: calculations.PMT,
            frequency: frequency,
            duration: typeof body.duration === 'number' ? body.duration : (body.duration === 'choose' ? endDate.diff(startDate, 'months') : parseInt(body.duration)),
            futureValue: calculations.future_value,
            totalContributionAmt: calculations.total_contribution_amount,
            interestRate: interestRate,
            interestAmt: calculations.interest_earned,
            effectiveInterestRate: calculations.effective_interest_rate,
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
            nextBillingDate, // Initial billing starts on the start date
            status: DBEnums?.OrderStatus?.find(g=>(g.name==='inprogress' || g.label==='inprogress'))?.code || 104,
            gateway: body.gateway,
            totalPaid: 0,
            totalPrincipal: 0,
            isLocked: false,
         });
      return { success: true, code: 201, message: `Plan subscribed successfully`, 
         data: {
            initialAmt,
            startDate, endDate,
            lockedInPlan,
            calculations,
            nextBillingDate
         } };
   }
}