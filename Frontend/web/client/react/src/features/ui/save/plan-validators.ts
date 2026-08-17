import * as yup from "yup";
import formatCurrency from "../../../hooks/FormatCurrency";

export const withdrawPlanSchema = yup.object().shape({
  type: yup.string().required("Withdraw type is required"),

  amount: yup
    .number()
    .when("type", {
      is: "partial",
      then: (schema) => schema.required("Amount is required"),
      otherwise: (schema) => schema.notRequired(),
    })
    .typeError("Amount must be a number") // Custom error if input is not a number
    .positive("Amount must be greater than zero")
    .min(1, "Minimum amount is 1")
    .max(yup.ref('$maxLimit'), ({ max }) => `Amount cannot exceed total savings ${formatCurrency(max, 'NGN', 'en-NG')}`),

  password: yup.string().required("Password is required"),
  reason: yup.string().required("Reason is required"),
  penaltyAcknowledged: yup.boolean().oneOf([true], "You must acknowledge the penalty charge").required("You must acknowledge the penalty charge"),
});

export const getBuyPlanSchema = (planTitle?: string, isPlanIN?: boolean, planMinAmount?: number, planMinDuration?: number) => {
  const is100M65 = planTitle === "100M65";
  const isSaveAMillion = planTitle?.toLowerCase() === "save a million";
  const isWadiah = planTitle === "Wadiah";
  const isEmergency = planTitle === "Emergency Savings";
  const isCustomGoalA = planTitle === "Custom Goal A";
  
  let minAmount = 50000;
  if (planMinAmount !== undefined && planMinAmount !== null) minAmount = planMinAmount;
  if (is100M65) minAmount = 100000000;
  if (isSaveAMillion) minAmount = 1000000;
  if (isWadiah || isEmergency || isCustomGoalA) minAmount = 0;

  return yup.object().shape({
    planName: yup
      .string()
      .optional()
      .max(50, "Plan name cannot exceed 50 characters"),
    amount: (isWadiah || isEmergency || isCustomGoalA)
      ? yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .optional()
          .typeError("Amount must be a number")
      : yup
          .number()
          .required("Amount is required")
          .typeError("Amount must be a number")
          .positive("Amount must be greater than zero")
          .min(minAmount, `Minimum target is ₦${minAmount.toLocaleString()}`),

    initialAmount: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .typeError("Amount must be a number")
      .min(0, "Amount must be 0 or greater")
      .test(
        "min-amount",
        function (value) {
          const targetAmt = this.parent.amount;
          if (isPlanIN === false && value !== undefined && value !== null && value > 0 && targetAmt) {
            if (value < targetAmt) {
              return this.createError({ message: `Initial deposit cannot be less than ₦${targetAmt.toLocaleString()}` });
            }
          }
          return true;
        }
      )
      .optional()
      .nullable(),

    frequency: yup.string().required("Frequency is required"),
    startDate: yup
      .date()
      .nullable()
      .required("Start date is required"),
    year: is100M65 
      ? yup.string().optional() 
      : yup.string().required("Year is required"),
    month: is100M65 
      ? yup.string().optional() 
      : yup.string().required("Month is required").test(
          "min-duration",
          function (monthValue) {
            const yearValue = parseInt(this.parent.year || "0", 10);
            const totalMonths = (yearValue * 12) + parseInt(monthValue || "0", 10);
            const minMonths = planMinDuration || 0;
            if (totalMonths < minMonths) {
              const minText = minMonths >= 12 
                ? (minMonths % 12 === 0 ? `${minMonths / 12} year(s)` : `${minMonths} months`) 
                : `${minMonths} months`;
              return this.createError({ message: `Minimum duration is ${minText}` });
            }
            if (totalMonths === 0 && !is100M65) {
               return this.createError({ message: "Duration must be greater than 0" });
            }
            return true;
          }
        ),
    endDate: is100M65 ? yup.date().nullable().required("End date is required") : yup.date().optional().nullable()
  });
};

