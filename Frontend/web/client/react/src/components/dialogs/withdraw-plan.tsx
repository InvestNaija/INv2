import { Dialog, type DialogProps } from "@mui/material";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { withdrawPlanSchema } from "../../features/ui/save/plan-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../atoms/input";
import Button from "../atoms/buttons";
import { useEffect, useState, useRef } from "react";
import formatCurrency from "../../hooks/FormatCurrency";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { encryptPassword } from "../../hooks/encryption";
import { useWalletFeatures } from "../../contexts/walletContext";
import { useSave } from "../../contexts/saveContext";
import { useUser } from "../../contexts/userContext";
import OtpVerification from "./otp-verification";
import axios from "axios";
import SaveIcon from "../../assets/icons/edu-icon.svg";

interface WithdrawPlanProps {
  setWithdrawPlanDialog: (open: boolean) => void;
  openWithdrawPlanDialog: boolean;
  planDetails?: any;
  activePlanLogo?: string;
}

const WithdrawPlan = (props: WithdrawPlanProps) => {
  const { planDetails } = props;
  const maxLimit = planDetails?.totalAvailablePayout ? Number(planDetails.totalAvailablePayout) : (planDetails?.balance || 0);
  
  const [step, setStep] = useState<"form" | "otp">("form");
  const [pendingLiquidation, setPendingLiquidation] = useState<any>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { currentUser } = useUser();
  const { liquidatePlan } = useSave();
  const { sendWithdrawOtp } = useWalletFeatures();

  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : fallback;

  const handleDialogClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      setStep("form");
      props.setWithdrawPlanDialog(false);
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(withdrawPlanSchema),
    context: { maxLimit: maxLimit },
    defaultValues: {
      type: "partial",
      amount: undefined,
      password: "",
      reason: "",
      penaltyAcknowledged: false,
    },
    mode: "onChange",
  });

  const currentType = watch("type");

  // Reset to "partial" every time the modal opens
  useEffect(() => {
    if (props.openWithdrawPlanDialog) {
      setValue("type", "partial");
      setValue("amount", 0);
      setValue("password", "");
      setValue("reason", "");
      setValue("penaltyAcknowledged", false);
    }
  }, [props.openWithdrawPlanDialog]);

  useEffect(() => {
    if (currentType === "full") {
      setValue("amount", maxLimit, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else if (currentType === "partial") {
      setValue("amount", 0);
    }
  }, [currentType, maxLimit, setValue]);

  const onSubmit = async (data: any) => {
    if (!currentUser?.email) {
      toast.error("Unable to verify your email. Please refresh and try again.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const encryptedPassword = await encryptPassword(
        data.password,
        import.meta.env.VITE_PUBLIC_KEY
      );

      await sendWithdrawOtp({
        email: currentUser.email,
        subject: "Verify Activity",
        message: "<p>Please verify your request to liquidate your plan</p>",
      });

      setPendingLiquidation({ ...data, encryptedPassword });
      setStep("otp");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send verification code"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!currentUser?.email) return;

    setIsSendingOtp(true);
    try {
      await sendWithdrawOtp({
        email: currentUser.email,
        subject: "Verify Activity",
        message: "<p>Please verify your request to liquidate your plan</p>",
      });
      toast.success("A new code has been sent to your email");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to resend verification code"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    if (!currentUser?.email || !pendingLiquidation) return;

    setIsWithdrawing(true);
    try {
      const response = await liquidatePlan({
        email: currentUser.email,
        resendOtp: false,
        signature: "",
        product_id: planDetails?.saveplan_user?.id,
        liquidationType: pendingLiquidation.type === "partial" ? "part" : "full",
        amount: pendingLiquidation.type === "partial" ? pendingLiquidation.amount : maxLimit,
        password: pendingLiquidation.encryptedPassword,
        reason: pendingLiquidation.reason,
        token: otp,
      });

      toast.success(response?.message || "Liquidation completed successfully");
      setStep("form");
      props.setWithdrawPlanDialog(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Liquidation failed. Please try again."));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const reasons = [
    "Pay bills/fees",
    "I want higher returns",
    "Pay off debt",
    "Other"
  ];

  const currency = planDetails?.currency || "NGN";
  
  const contributedAmt = planDetails?.contributedAmount || planDetails?.totalContributed || planDetails?.balance || 0;
  const accruedInt = planDetails?.accrued_interest || 0;
  const startDateStr = planDetails?.startDate ? dayjs(planDetails.startDate).format("MMM D, YYYY") : "-";
  const percentComplete = planDetails?.percentageComplete ? `${planDetails.percentageComplete}%` : "0.00%";
  const penalty = planDetails?.penalty || 0;
  const withholdingTax = planDetails?.withholding_tax || planDetails?.tax || 0;
  const totalAvailablePayout = planDetails?.totalAvailablePayout || (contributedAmt + accruedInt - penalty - withholdingTax);

  const metricBox = (label: string, value: string) => (
    <div className="flex flex-col items-start text-left">
      <div className="text-[12px] text-[#8F9BBA] font-bold uppercase tracking-[0.5px] mb-1">{label}</div>
      <div className="text-[16px] text-[#1B2559] font-semibold leading-[24px]">{value}</div>
    </div>
  );

  return (
    <>
    <Dialog
      open={props.openWithdrawPlanDialog && step === "form"}
      onClose={handleDialogClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(0px)",
            opacity: "0.5",
          },
        },
        paper: {
          sx: {
            backgroundColor: "#fff",
            borderRadius: "0",
            padding: "0",
            height: "100vh !important",
            maxHeight: "100vh !important",
            position: "absolute",
            top: "0",
            right: "0",
            margin: "0",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Header (Fixed) */}
      <div className="flex-shrink-0 relative px-[32px] pt-[34px] pb-[24px] border-b border-[#E9EDF7] bg-white z-10 w-full">
        <div className="absolute top-[34px] left-[32px]">
          <span
            className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px] transition hover:bg-gray-100 block"
            onClick={() => props.setWithdrawPlanDialog(false)}
          >
            <i className="ri-close-fill text-[24px] leading-[28px]"></i>
          </span>
        </div>
        
        {/* Logo and Plan Title */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-white border border-[#E9EDF7] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden p-1">
            <img src={props.activePlanLogo || SaveIcon} height="64" width="64" alt="Plan Icon" className="w-full h-full object-contain" />
          </div>
          <h3 className="mt-[12px] text-[#1B2559] text-[20px] leading-[28px] font-bold text-center capitalize">
            {planDetails?.title || "Plan Details"}
          </h3>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[32px] pt-[32px] pb-[40px] md:w-[550px] xl:w-[650px] lg:w-[600px] sm:w-[450px] w-[100vw]">

        <h2 className="text-left text-[24px] leading-[32px] font-semibold text-[#0F0F0F] mb-[8px]">
          Liquidate Plan
        </h2>
        <p className="text-[#A1A1A1] text-[14px] mb-[32px]">Review your plan metrics and select your withdrawal preference.</p>
        
        {/* Premium Plan Overview Card */}
        <div className="bg-white rounded-[16px] border border-[#E9EDF7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden mb-[40px]">
            <div className="p-[24px] pb-[16px]">
              <h6 className="text-[16px] text-[#1B2559] font-bold leading-[24px] mb-[24px]">
                Plan Overview
              </h6>
              
              <div className="grid grid-cols-2 gap-y-[24px] gap-x-[16px]">
                {metricBox("Contributed Amount", formatCurrency(contributedAmt, currency))}
                {metricBox("Accrued Interest", formatCurrency(accruedInt, currency))}
                {metricBox("Start Date", startDateStr)}
                {metricBox("Percentage Complete", percentComplete)}
                {metricBox("Penalty", formatCurrency(penalty, currency))}
                {metricBox("Withholding Tax", formatCurrency(withholdingTax, currency))}
              </div>
            </div>
            
            <div className="mt-[8px] bg-[#F4F7FE] px-[24px] py-[20px] flex justify-between items-center border-t border-[#E9EDF7]">
              <div className="text-[14px] text-[#8F9BBA] font-bold uppercase tracking-[0.5px]">Total Available Payout</div>
              <div className="text-[22px] text-[#1B2559] font-extrabold leading-[30px] tracking-tight">{formatCurrency(totalAvailablePayout, currency)}</div>
            </div>
          </div>

        <form id="liquidate-form" onSubmit={handleSubmit(onSubmit)}>
          <h6 className="text-[14px] text-[#0F0F0F] font-bold leading-[20px] tracking-[0.1px] mb-[16px]">
            Liquidation Action
          </h6>

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <RadioGroup 
                {...field} 
                className="grid grid-cols-2 gap-4 mb-[32px]"
              >
                <div className={`relative flex items-start p-4 cursor-pointer rounded-[12px] border-2 transition-all duration-200 ${currentType === 'partial' ? 'border-[#E5333E] bg-[#FFF5F5]' : 'border-[#E9EDF7] bg-white hover:border-[#D1D5DB]'}`}>
                  <FormControlLabel 
                    value="partial" 
                    className="w-full m-0 flex items-start"
                    control={
                      <Radio 
                        sx={{ 
                          color: "#CBD5E1", 
                          padding: "0 12px 0 0",
                          "&.Mui-checked": { color: "#E5333E" } 
                        }} 
                      />
                    } 
                    label={
                      <div className="flex flex-col">
                        <span className={`text-[15px] font-bold ${currentType === 'partial' ? 'text-[#E5333E]' : 'text-[#1B2559]'}`}>Part Liquidation</span>
                        <span className="text-[12px] text-[#8F9BBA] mt-1 font-medium leading-tight">Withdraw a specific amount from your plan</span>
                      </div>
                    } 
                  />
                </div>

                <div className={`relative flex items-start p-4 cursor-pointer rounded-[12px] border-2 transition-all duration-200 ${currentType === 'full' ? 'border-[#E5333E] bg-[#FFF5F5]' : 'border-[#E9EDF7] bg-white hover:border-[#D1D5DB]'}`}>
                  <FormControlLabel 
                    value="full" 
                    className="w-full m-0 flex items-start"
                    control={
                      <Radio 
                        sx={{ 
                          color: "#CBD5E1", 
                          padding: "0 12px 0 0",
                          "&.Mui-checked": { color: "#E5333E" } 
                        }} 
                      />
                    } 
                    label={
                      <div className="flex flex-col">
                        <span className={`text-[15px] font-bold ${currentType === 'full' ? 'text-[#E5333E]' : 'text-[#1B2559]'}`}>Full Liquidation</span>
                        <span className="text-[12px] text-[#8F9BBA] mt-1 font-medium leading-tight">Withdraw the entire available balance</span>
                      </div>
                    } 
                  />
                </div>
              </RadioGroup>
            )}
          />

          {currentType === "partial" && (
            <div className="mb-[24px]">
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    error={errors.amount?.message}
                    placeholder="Enter amount to withdraw"
                  />
                )}
              />
            </div>
          )}

          <div className="mb-[24px]">
            <label className="block text-[13px] font-semibold text-[#1B2559] mb-[8px] uppercase tracking-[0.5px]">
              Account Password
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  type="password"
                  {...field}
                  error={errors.password?.message}
                  placeholder="Enter your IN password to confirm"
                />
              )}
            />
          </div>

          <div className="mb-[24px]">
            <label className="block text-[13px] font-semibold text-[#1B2559] mb-[8px] uppercase tracking-[0.5px]">
              Reason for Liquidation
            </label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => {
                const [isOpen, setIsOpen] = useState(false);
                const dropdownRef = useRef<HTMLDivElement>(null);

                useEffect(() => {
                  const handleClickOutside = (e: MouseEvent) => {
                    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                      setIsOpen(false);
                    }
                  };
                  document.addEventListener("mousedown", handleClickOutside);
                  return () => document.removeEventListener("mousedown", handleClickOutside);
                }, []);

                return (
                  <div className="relative" ref={dropdownRef}>
                    {/* Trigger button */}
                    <button
                      type="button"
                      onClick={() => setIsOpen((o) => !o)}
                      className={`w-full h-[56px] pl-[16px] pr-[48px] text-left border-2 rounded-[14px] text-[15px] font-medium transition-all duration-200 ${
                        errors.reason
                          ? 'border-red-400 bg-[#FFF5F5] text-red-500'
                          : field.value
                          ? 'border-[#1B2559] bg-white text-[#1B2559]'
                          : 'border-[#E9EDF7] bg-[#FAFBFF] text-[#A1A1A1] hover:border-[#B0BFDF]'
                      }`}
                    >
                      {field.value || "Select a reason..."}
                    </button>

                    {/* Chevron icon */}
                    <div className={`absolute inset-y-0 right-0 flex items-center pr-[16px] pointer-events-none transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    } ${field.value ? 'text-[#1B2559]' : 'text-[#A1A1A1]'}`}>
                      <i className="ri-arrow-down-s-line text-[22px]"></i>
                    </div>

                    {/* Custom options dropdown */}
                    {isOpen && (
                      <div className="absolute z-50 w-full mt-[6px] bg-white border border-[#E9EDF7] rounded-[16px] shadow-[0_8px_32px_rgba(27,37,89,0.12)] overflow-hidden">
                        {reasons.map((r, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              field.onChange(r);
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-[20px] py-[14px] text-left text-[14px] font-medium transition-all duration-150 ${
                              field.value === r
                                ? 'bg-[#1B2559] text-white'
                                : 'text-[#1B2559] hover:bg-[#F4F7FE] hover:text-[#1B2559]'
                            } ${
                              i !== 0 ? 'border-t border-[#F0F3FA]' : ''
                            }`}
                          >
                            <span>{r}</span>
                            {field.value === r && (
                              <i className="ri-check-line text-[18px] text-white"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {errors.reason && (
                      <p className="flex items-center gap-1 text-red-500 text-[12px] mt-[6px] font-medium">
                        <i className="ri-error-warning-line text-[14px]"></i>
                        {errors.reason.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>

          <div className="mb-[32px]">
            <Controller
              name="penaltyAcknowledged"
              control={control}
              render={({ field }) => (
                <div className={`p-[16px] rounded-[12px] flex items-start space-x-3 transition-colors ${field.value ? 'bg-[#FFF5F5] border border-[#FFE0E0]' : 'bg-[#FAFAFA] border border-[#E9EDF7] hover:bg-[#F3F4F6]'}`}>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-1 min-w-[20px] w-[20px] h-[20px] rounded border-[#CBD5E1] text-[#E5333E] focus:ring-[#E5333E] accent-[#E5333E] cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <i className={`ri-error-warning-fill text-[18px] ${field.value ? 'text-[#E5333E]' : 'text-[#8F9BBA]'}`}></i>
                      <span className={`text-[14px] font-bold ${field.value ? 'text-[#E5333E]' : 'text-[#1B2559]'}`}>Important Warning</span>
                    </div>
                    <span className={`block text-[13px] leading-[20px] ${field.value ? 'text-[#E5333E]' : 'text-[#8F9BBA]'}`}>
                      Please note that terminating this plan before your set maturity date incurs a penalty charge of <strong>{planDetails?.penaltyPercentage || 'your plan\'s set percentage'}%</strong> on your accrued interest.
                    </span>
                  </div>
                </div>
              )}
            />
            {errors.penaltyAcknowledged && (
              <p className="text-red-500 text-xs mt-[8px]">{errors.penaltyAcknowledged.message}</p>
            )}
          </div>

        </form>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="flex-shrink-0 px-[32px] py-[24px] border-t border-[#F0F0F0] bg-white w-full">
        <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => props.setWithdrawPlanDialog(false)}
              variant="empty"
              className="flex-1 rounded-[12px] h-[56px] text-[16px] font-bold border-[#E9EDF7] text-[#8F9BBA] hover:bg-[#F3F4F6]"
            >
            Cancel
          </Button>
            <Button
              type="submit"
              form="liquidate-form"
              disabled={isSendingOtp}
              isLoading={isSendingOtp}
              variant="primary"
              className="flex-1 rounded-[12px] h-[56px] text-[16px] font-bold bg-[#E5333E] hover:bg-[#C92A33]"
            >
            Liquidate Plan
          </Button>
        </div>
      </div>
    </Dialog>

    <OtpVerification
      openDialog={props.openWithdrawPlanDialog && step === "otp"}
      setDialog={(open) => {
        if (!open) {
          setStep("form");
          props.setWithdrawPlanDialog(false);
        }
      }}
      email={currentUser?.email ?? ""}
      title="Verify Activity"
      description="We sent a 6 digit code to your email"
      isSubmitting={isWithdrawing}
      isResending={isSendingOtp}
      onSubmit={handleOtpSubmit}
      onResend={handleResendOtp}
    />
    </>
  );
};

export default WithdrawPlan;
