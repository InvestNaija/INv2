import React, { useState, useEffect, useRef, useMemo } from "react";
import { Portal } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSave } from "../../../../contexts/saveContext";
import type { SavePlan } from "../../../../models/savePlanModel";
import { useUser } from "../../../../contexts/userContext";
import type { SavePlanListCardProps } from "../save-list/interface";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import SaveIcon from "../../../../assets/icons/edu-icon.svg";
import INIcon from "../../../../assets/icons/investnaija-without-chapel.svg";
import Button from "../../../../components/atoms/buttons";
import Label from "../../../../components/atoms/labels";
import { DatePickerInput } from "../../../../components/atoms/date-picker";
import Checkbox from "../../../../components/atoms/checkbox";
import { getBuyPlanSchema } from "../plan-validators";
import type { buyPlanDTO } from "../interface";
import { toast } from "react-toastify";
import PaymentGateway from "../../../../components/dialogs/payment-gateway";
import PaymentSuccess from "../../../../components/dialogs/payment-success";
import AdditionalKyc from "../../../../components/dialogs/additional-kyc";
import AccountVerification from "../../../../components/dialogs/account-verification";
import getVerificationMessage from "../../../../hooks/getVerificationMessage";
import isKycComplete from "../../../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../../../hooks/isAdditionalKycComplete";
import { type PaymentGatewayConfig, type SavedCard } from "../../../../models/walletModel";
import { useWalletFeatures } from "../../../../contexts/walletContext";

const DurationCounter = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  unit 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  min: number, 
  max: number, 
  unit: 'year' | 'month' 
}) => {
  const numValue = parseInt(value || "0", 10);
  
  const handleDecrement = () => {
    if (numValue > min) {
      const newVal = numValue - 1;
      onChange(unit === 'month' ? newVal.toString().padStart(2, '0') : newVal.toString());
    }
  };

  const handleIncrement = () => {
    if (numValue < max) {
      const newVal = numValue + 1;
      onChange(unit === 'month' ? newVal.toString().padStart(2, '0') : newVal.toString());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-[16px] px-[12px] bg-[#FCFCFC] border border-[#F0F0F0] rounded-[20px] transition-all duration-300 hover:border-[#00585E]/30 relative overflow-hidden group">
      <span className="text-[#5A5A5A] text-[13px] font-medium mb-3 relative z-10">
        {label}
      </span>
      <div className="flex items-center justify-between w-full max-w-[130px] relative z-10">
        <button 
          type="button"
          onClick={handleDecrement}
          disabled={numValue <= min}
          className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center bg-white shadow-sm border border-[#EBEBEB] text-[#111111] disabled:opacity-40"
        >
          <i className="ri-subtract-line text-[18px]"></i>
        </button>
        <div className="flex flex-col items-center justify-center w-[44px]">
          <span className="text-[24px] font-bold text-[#111111] leading-none tracking-tight">
            {numValue}
          </span>
          <span className="text-[10px] text-[#A0A0A0] font-medium uppercase tracking-wider mt-1">
            {numValue === 1 ? unit : unit + 's'}
          </span>
        </div>
        <button 
          type="button"
          onClick={handleIncrement}
          disabled={numValue >= max}
          className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center bg-white shadow-sm border border-[#EBEBEB] text-[#111111] disabled:opacity-40"
        >
          <i className="ri-add-line text-[18px]"></i>
        </button>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <button 
    type="button" 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-[28px] w-[50px] items-center rounded-full transition-colors ${checked ? 'bg-[#E77731]' : 'bg-white/20'}`}
  >
    <span className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white transition-transform ${checked ? 'translate-x-[25px]' : 'translate-x-[3px]'}`} />
  </button>
);

const SavePlanDrilldown = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { type: customType, name: customName } = location.state || {};

  const [plan, setPlan] = useState<SavePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otherPlans, setOtherPlans] = useState<SavePlanListCardProps[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const { fetchCustomSavePlan, fetchSavePlanById, fetchPlaninList, fetchSaveinList, createSavePlan, calculatePlaninValues, calculateSaveinValues } = useSave();
  const { fetchPaymentGatewayOptions, fetchGatewaySavedCards, balance: walletContextBalance } = useWalletFeatures();

  const { currentUser } = useUser();
  const [calculatorResult, setCalculatorResult] = useState<{
    PMT: string;
    future_value: string;
    total_contribution_amount: string;
    interest_earned: string;
    effective_interest_rate: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  const is100M65 = plan?.title === "100M65";
  const isEmergency = plan?.title?.toLowerCase().includes("emergency");
  const isPlanIN = ((plan as any)?.saveplan_calculator_type?.type_name || plan?.type) === "planin" || customType === "planin";
  
  const currentAge = currentUser?.dob ? new Date().getFullYear() - new Date(currentUser.dob).getFullYear() : 33;
  const targetRetirementAge = 65;
  const yearsToRetirement = Math.max(targetRetirementAge - currentAge, 1);
  const retirementDate = currentUser?.dob 
    ? new Date(new Date(currentUser.dob).setFullYear(new Date(currentUser.dob).getFullYear() + targetRetirementAge))
    : new Date(new Date().setFullYear(new Date().getFullYear() + yearsToRetirement));

  const [activeStep, setActiveStep] = useState(0);
  const [showInitialDeposit, setShowInitialDeposit] = useState(false);

  const [openPaymentGateway, setOpenPaymentGateway] = useState(false);
  const [paymentGatewayConfigs, setPaymentGatewayConfigs] = useState<PaymentGatewayConfig[]>([]);
  const [availablePartners, setAvailablePartners] = useState<string[]>([]);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [openPaymentSuccess, setOpenPaymentSuccess] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const validationSchema = useMemo(() => getBuyPlanSchema(plan?.title, isPlanIN, plan?.min_amount, plan?.min_duration), [plan?.title, isPlanIN, plan?.min_amount, plan?.min_duration]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<buyPlanDTO>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      planName: "",
      amount: undefined,
      initialAmount: undefined,
      frequency: "",
      startDate: new Date(),
      year: "0",
      month: "01",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!id) return;
    const fetchPlan = async () => {
      if (id === 'custom') {
        try {
          const type = customType || "savein";
          const res = await fetchCustomSavePlan(type);
          if (res.success) {
            setPlan(res.data);
            if (customName) {
              setValue("planName", customName);
            }
          }
        } catch (err) {
          console.error("Failed to fetch custom plan details", err);
        } finally {
          setIsLoading(false);
          setActiveStep(1);
        }
        return;
      }

      try {
        const res = await fetchSavePlanById(id as string);
        if (res.success) {
          setPlan(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchOtherPlans = async () => {
      setIsPlansLoading(true);
      try {
        const [planinRes, saveinRes] = await Promise.allSettled([
          fetchPlaninList(),
          fetchSaveinList()
        ]);
        
        let combined: any[] = [];
        if (planinRes.status === "fulfilled" && planinRes.value.success) {
          combined = [...combined, ...planinRes.value.data.rows];
        }
        if (saveinRes.status === "fulfilled" && saveinRes.value.success) {
          combined = [...combined, ...saveinRes.value.data.rows];
        }
        
        combined.push({
          id: "custom",
          title: "Custom Plan",
          description: "Create your own savings plan tailored exactly to your goals.",
          logo: null,
          icon: null,
          interest_rate: null,
          min_duration: 1,
          min_amount: 1000,
        });

        const filtered = combined.filter((p) => p.id !== id);
        
        setOtherPlans(
          filtered.map((item) => ({
            id: item.id,
            name: item.title,
            image: item.logo || item.icon || "",
            description: item.description,
            interest_rate: item.interest_rate,
            min_duration: item.min_duration,
            min_amount: item.min_amount,
          }))
        );
      } catch (err) {
        console.error("Failed to load other plans", err);
      } finally {
        setIsPlansLoading(false);
      }
    };

    fetchPlan();
    fetchOtherPlans();
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (id !== 'custom') {
      setActiveStep(0);
    }
  }, [id, customName, setValue]);

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const termsLink = (
    <span className="text-[#5A5A5A] text-[14px] font-medium leading-[20px]">
      I acknowledge that I have read, understood and agree to the
      <a
        href="/auth/legal/planin_savein_disclaimer"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#E77731] hover:text-[#C55D21] transition-colors font-semibold ml-1 underline decoration-1 underline-offset-2"
      >
        Terms & Conditions
      </a>.
    </span>
  );

  useEffect(() => {
    // Only reset if it's not custom, otherwise it overrides the preset plan name
    if (id !== 'custom') {
      reset({
        planName: "",
        amount: undefined,
        initialAmount: undefined,
        frequency: "",
        startDate: new Date(),
        year: "0",
        month: "01",
      });
    }
    setCalculatorResult(null);
    setIsTermsAccepted(false);
    setTermsError(false);
    setShowInitialDeposit(false);
  }, [id, reset]);

  const handleNext = async () => {
    let isValid = true;
    if (activeStep === 1) {
      isValid = await trigger(["amount", "planName", "initialAmount"]);
    } else if (activeStep === 2) {
      isValid = await trigger(["startDate", "year", "month"]);
    } else if (activeStep === 3) {
      isValid = await trigger(["frequency"]);
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const formData = watch();

  useEffect(() => {
    if (plan) {
      const presetAmount = (plan as any).target || plan.min_amount;
      if (presetAmount) {
        setValue("amount", presetAmount);
      }

      if (is100M65) {
        setValue("endDate", retirementDate);
      }
      
      const minDur = plan.min_duration || 0;
      if (minDur > 0) {
        const y = Math.floor(minDur / 12);
        const m = minDur % 12;
        setValue("year", String(y));
        setValue("month", String(m).padStart(2, '0'));
      }
    }
  }, [plan, is100M65, setValue]);

  useEffect(() => {
    const runCalculator = async () => {
      if (!formData.amount || !formData.startDate) return;
      if (is100M65 && !formData.endDate) return;
      if (!is100M65 && (!formData.year && !formData.month)) return;

      let calculatedEndDate = new Date(formData.startDate);
      if (is100M65 && formData.endDate) {
        calculatedEndDate = formData.endDate;
      } else {
        const years = parseInt(formData.year || "0", 10);
        const months = parseInt(formData.month || "0", 10);
        if (years) calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + years);
        if (months) calculatedEndDate.setMonth(calculatedEndDate.getMonth() + months);
      }

      const frequency = formData.frequency || "Monthly";
      const effectiveTargetAmount = isEmergency && formData.amount ? formData.amount * 3 : (formData.amount || 0);

      const payload = {
        saveplan_id: id,
        plan_name: formData.planName || plan?.title,
        amount: Number(effectiveTargetAmount),
        initial_amt: Number(formData.initialAmount) || 0,
        frequency: frequency.toLowerCase(),
        startDate: formData.startDate.toISOString(),
        endDate: calculatedEndDate.toISOString().split('T')[0],
        interest_rate: is100M65 ? 15 : (plan?.interest_rate || 0),
      };

      try {
        if (isPlanIN) {
          const res = await calculatePlaninValues(payload);
          if (res.success) setCalculatorResult(res.data);
        } else {
          const res = await calculateSaveinValues(payload);
          if (res.success) setCalculatorResult(res.data);
        }
      } catch (err) {
        console.error("Calculator error", err);
      }
    };
    
    const timeoutId = setTimeout(runCalculator, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.amount, formData.initialAmount, formData.frequency, formData.startDate, formData.year, formData.month, formData.endDate, is100M65, isPlanIN, plan?.interest_rate]);

  const getMaturityDate = () => {
    if (!formData.startDate) return "--";
    const date = new Date(formData.startDate);
    const years = parseInt(formData.year || "0", 10);
    const months = parseInt(formData.month || "0", 10);
    if (years) date.setFullYear(date.getFullYear() + years);
    if (months) date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStartDate = () => {
    if (!formData.startDate) return "--";
    return new Date(formData.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const fetchPaymentConfigs = async () => {
    setIsLoadingConfigs(true);
    try {
      const [res, cardsRes] = await Promise.all([
        fetchPaymentGatewayOptions("saveplan", plan?.id || ""),
        fetchGatewaySavedCards(currentUser?.id || ""),
      ]);
      setPaymentGatewayConfigs(res.data || []);
      setAvailablePartners((res.data || []).map((c: PaymentGatewayConfig) => c.gateway));
      setSavedCards(cardsRes.data || []);
      setWalletBalance(walletContextBalance || 0);
    } catch (err) {
      toast.error("Failed to load payment options");
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const handlePaymentContinue = async (
    _amount: number,
    method: string,
    partner?: string,
    cardId?: string,
    _receiptFile?: File,
    _saveCard?: boolean
  ) => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    if (!plan) return;

    setIsSubmittingPayment(true);
    try {
      const selectedConfig = paymentGatewayConfigs.find(c => c.gateway === (partner || "paystack")) || paymentGatewayConfigs[0];
      const gatewayId = selectedConfig?.id;
      const redirectUrl = `${window.location.protocol}//${window.location.host}/app/save/dashboard`;
      const isNewCardPayment = method === "payment_partners" && !cardId;

      let totalMonths = 0;
      let calculatedEndDate = new Date(formData.startDate || new Date());
      if (is100M65 && formData.endDate) {
        calculatedEndDate = new Date(formData.endDate);
      } else {
        const years = parseInt(formData.year || "0", 10);
        const months = parseInt(formData.month || "0", 10);
        totalMonths = (years * 12) + months;
        if (years) calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + years);
        if (months) calculatedEndDate.setMonth(calculatedEndDate.getMonth() + months);
      }

      const frequency = (formData.frequency || "Monthly").toLowerCase();
      const amt = Number(formData.amount || 0);
      const effectiveTargetAmount = isEmergency && amt ? amt * 3 : amt;

      const payload: any = {
        amount: effectiveTargetAmount,
        paymentMethod: method === "wallet" ? "wallet" : "online",
        gateway: method === "wallet" ? "wallet" : (method === "direct_transfer" ? "banktransfer" : (partner || "paystack")),
        title: formData.planName || plan.title || "Plan",
        initial_amt: Number(formData.initialAmount || 0),
        frequency: frequency,
        startDate: (formData.startDate ? new Date(formData.startDate) : new Date()).toISOString().split('T')[0],
        duration: totalMonths > 0 ? String(totalMonths) : "choose",
        currency: "NGN",
        customEndDate: totalMonths > 0 ? null : calculatedEndDate.toISOString(),
        tAndCChecked: true,
        source: isPlanIN ? "planin" : "savein",
        type: "debit",
        custom: plan.id === "custom",
        productId: plan.id,
        product_type: isPlanIN ? "planin" : "savein",
        redirect_url: redirectUrl,
        post_url: `${import.meta.env.VITE_SAVEPLAN_BASE_URL}/save-plan/customer/create`,
        gatewayEndpoints: `${import.meta.env.VITE_BASE_URL}/3rd-party-services/gateway?modules=saveplan&id=${plan.id}`,
        callback_params: {
          module: "saveplan",
          method: "create",
          asset_id: plan.id,
          ...(isNewCardPayment ? { gateway_id: gatewayId } : {}),
          saveCard: method === "payment_partners" && !cardId,
          brokerageInfo: {}
        },
        ...(cardId ? { payment_type: "saved_card", saved_card_id: cardId } : {}),
        ...(isNewCardPayment ? {
          gateway_id: gatewayId,
          channel: partner || "paystack",
          channels: ["card", "bank_transfer"]
        } : {}),
        ...(method === "direct_transfer" ? { channel: "banktransfer" } : {})
      };

      const response = await createSavePlan(payload);

      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
        return;
      }

      setOpenPaymentGateway(false);
      setOpenPaymentSuccess(true);
    } catch (error: any) {
      console.error(error);
      const verificationMessage = getVerificationMessage(error);
      if (verificationMessage) {
        toast.error(verificationMessage);
        setOpenAdditionalKyc(true);
        return;
      }
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || "Failed to process plan creation";
      toast.error(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const onSubmit = async (_data: buyPlanDTO) => {
    setOpenPaymentGateway(true);
    fetchPaymentConfigs();
  };

  if (isLoading) {
    return (
      <Portal>
        <div className="fixed inset-0 w-full min-h-[100dvh] flex flex-col items-center bg-[#F9F9F9] overflow-y-auto" style={{ zIndex: 1300 }}>
          <div className="w-full bg-[#F9F9F9] sticky top-0 z-50">
            <div className="grid grid-cols-3 py-[16px] sm:py-[24px] items-center px-[16px] sm:px-[24px]">
              <div className="flex justify-self-start">
                <div
                  className="cursor-pointer inline-flex items-center gap-[6px] bg-[#FFFFFF] hover:bg-[#F7F7F7] active:scale-95 transition-all px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] rounded-full border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M22.0003 13.0001L22.0004 11.0002H5.82845L9.77817 7.05044L8.36396 5.63623L2 12.0002L8.36396 18.3642L9.77817 16.9499L5.8284 13.0002L22.0003 13.0001Z" fill="#0F0F0F"/></svg>
                  <span className="text-[#0F0F0F] text-[13px] sm:text-[14px] leading-[20px] font-medium whitespace-nowrap">Back</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-[1152px] px-[16px] sm:px-[20px] mx-auto mt-[55px]">
            <div className="flex flex-col gap-6 py-6 animate-pulse">
              <div className="h-[200px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
              <div className="h-[400px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
              <div className="h-[200px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  if (!plan) {
    return (
      <Portal>
        <div className="fixed inset-0 w-full min-h-[100dvh] flex flex-col items-center justify-center bg-white overflow-y-auto" style={{ zIndex: 1300 }}>
          <h2 className="text-xl font-bold mb-4">Plan not found</h2>
          <Button variant="primary" onClick={() => navigate(-1)} className="rounded-full w-[200px] h-[48px]">Go Back</Button>
        </div>
      </Portal>
    );
  }

  const stepLabels = {
    1: 'Goal Info',
    2: isPlanIN ? 'Target Amount' : 'Contribution',
    3: 'Timeline',
    4: 'Contribution Plan'
  };

  return (
    <Portal>
      <div ref={containerRef} className="fixed inset-0 w-full min-h-[100dvh] bg-[#F9F9F9] overflow-y-auto" style={{ zIndex: 1300 }}>
        <div className="w-full bg-[#F9F9F9] sticky top-0 z-50">
          <div className="grid grid-cols-3 py-[16px] sm:py-[24px] items-center px-[16px] sm:px-[24px]">
            <div className="flex justify-self-start">
              <div
                onClick={() => {
                  if (activeStep === 0 || (id === 'custom' && activeStep === 1)) navigate(-1);
                  else handleBack();
                }}
                className="cursor-pointer inline-flex items-center gap-[6px] bg-[#FFFFFF] hover:bg-[#F7F7F7] active:scale-95 transition-all px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] rounded-full border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M22.0003 13.0001L22.0004 11.0002H5.82845L9.77817 7.05044L8.36396 5.63623L2 12.0002L8.36396 18.3642L9.77817 16.9499L5.8284 13.0002L22.0003 13.0001Z" fill="#0F0F0F"/></svg>
                <span className="text-[#0F0F0F] text-[13px] sm:text-[14px] leading-[20px] font-medium whitespace-nowrap">Back</span>
              </div>
            </div>
            
            <div className="flex items-center justify-self-center">
              <img src={INIcon} alt="IN Icon" className="h-[22px] sm:h-[28px] w-auto" />
            </div>
            
            <div className="flex justify-self-end">
              <div
                onClick={() => navigate('/app/save/dashboard')}
                className="cursor-pointer inline-flex items-center justify-center bg-transparent hover:bg-black/5 active:scale-95 transition-all px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] rounded-full"
              >
                <span className="text-[#5A5A5A] hover:text-[#0F0F0F] text-[14px] sm:text-[15px] leading-[20px] font-medium whitespace-nowrap transition-colors">Cancel</span>
              </div>
            </div>
          </div>

        {activeStep > 0 && (
          <div className="flex justify-center mt-4 mb-8 px-4">
            <div className="inline-flex items-center gap-4 bg-white/95 backdrop-blur-2xl px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-[#F0F0F0] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
              
              {/* Circular Progress Ring */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="in-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF9B5E" />
                      <stop offset="100%" stopColor="#E77731" />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <path
                    className="text-[#00585E]/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    strokeDasharray={`${((id === 'custom' ? activeStep + 2 : activeStep) / (id === 'custom' ? 6 : 4)) * 100}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    stroke="url(#in-gradient)"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[13px] font-black text-[#00585E]">{id === 'custom' ? activeStep + 2 : activeStep}</span>
                </div>
              </div>
              
              {/* Labels */}
              <div className="flex flex-col justify-center min-w-[120px]">
                <span className="text-[10px] font-bold text-[#E77731] uppercase tracking-[0.15em] mb-0.5">
                  Step {id === 'custom' ? activeStep + 2 : activeStep} of {id === 'custom' ? 6 : 4}
                </span>
                <span className="text-[15px] font-bold text-[#00585E] leading-none tracking-tight">
                  {id === 'custom' 
                    ? (activeStep === 1 ? (isPlanIN ? 'Target Amount' : 'Contribution') : activeStep === 2 ? 'Timeline' : activeStep === 3 ? 'Contribution Plan' : 'Review')
                    : stepLabels[activeStep as keyof typeof stepLabels]}
                </span>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-[16px] px-[20px] pb-[120px]">
        <div className="w-full md:w-[552px] xl:w-[552px] lg:w-[552px]">
          {activeStep === 0 && (
            <div className="animate-fade-in mt-6">
              {is100M65 ? (
                <div className="flex flex-col">
                  <div className="flex justify-center">
                    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[24px] bg-white border border-[#F0F0F0] shadow-sm overflow-hidden p-2">
                      <img
                        src={plan.logo || plan.icon || SaveIcon}
                        height="80"
                        width="80"
                        alt={`${plan.title} Icon`}
                        className="object-cover w-full h-full rounded-[16px]"
                        onError={(e) => { e.currentTarget.src = SaveIcon; }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 mb-6">
                    <h3 className="text-[#111111] text-[28px] leading-[36px] font-bold text-center tracking-[-0.5px]">
                      {plan.title}
                    </h3>
                  </div>

                  <div className="w-full bg-[#1A1A1A] rounded-[16px] mb-8 p-8 shadow-sm flex flex-col items-center justify-center min-h-[160px] border border-[#333333]">
                    <p className="text-white font-bold text-[20px] leading-[28px] text-center tracking-[-0.3px]">
                      Become a multi-millionaire at 65. Join the challenge and achieve <span className="text-[#E77731]">₦100million</span> by age 65
                    </p>
                  </div>

                  <div className="flex flex-col gap-8 px-2 mb-12">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 flex-shrink-0">
                        <i className="ri-focus-3-line text-[#E77731] text-[36px]"></i>
                      </div>
                      <div>
                        <h4 className="text-[#111111] font-bold text-[16px] mb-1">The Power of Compounding</h4>
                        <p className="text-[#5A5A5A] text-[14px] leading-[22px]">
                          100M65 is possible because of the significant growth potential of long-term investments through the power of compounding.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="mt-1 flex-shrink-0">
                        <div className="bg-[#E77731] w-9 h-9 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-[20px]">₦</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[#111111] font-bold text-[16px] mb-1">Never too early or late to start</h4>
                        <p className="text-[#5A5A5A] text-[14px] leading-[22px]">
                          Join the 100M65 movement to attain a retirement fund of ₦100 million by age 65
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center mt-2">
                       <a href="https://investnaija.com/100-million-65" target="_blank" rel="noopener noreferrer" className="text-[#E77731] underline text-[14px]">Click here</a> <span className="text-[#5A5A5A] text-[14px]">to learn more</span>
                    </div>
                  </div>

                  <div className="mt-[24px]">
                    <Button
                      variant="primary"
                      className="rounded-[16px] h-[60px] mb-[24px] w-full text-[16px] font-semibold bg-[#00585E] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      onClick={() => handleNext()}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[24px] bg-white border border-[#F0F0F0] shadow-sm overflow-hidden p-2">
                      <img
                        src={plan.logo || plan.icon || SaveIcon}
                        height="80"
                        width="80"
                        alt={`${plan.title} Icon`}
                        className="object-cover w-full h-full rounded-[16px]"
                        onError={(e) => { e.currentTarget.src = SaveIcon; }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-[#111111] text-[32px] leading-[40px] font-bold text-center tracking-[-0.5px]">
                      {plan.title}
                    </h3>
                  </div>
                  
                  <div className="text-center mt-3 px-2">
                    <p className="text-[#5A5A5A] text-[16px] leading-[26px] font-normal text-center max-w-[400px] mx-auto">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-[48px]">
                    <Button
                      variant="primary"
                      className="rounded-[16px] h-[60px] mb-[24px] w-full text-[16px] font-semibold bg-[#00585E] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      onClick={() => handleNext()}
                    >
                      Get Started
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {activeStep === 1 && (
              <div className="mt-6 animate-fade-in flex flex-col items-center">
                <div className="bg-[#FFF5F0] w-[80px] h-[80px] rounded-[24px] flex items-center justify-center mb-6 shadow-sm border border-[#FFE4D6]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#E77731" strokeWidth="2.5"/>
                    <circle cx="12" cy="12" r="5" stroke="#E77731" strokeWidth="2.5"/>
                    <circle cx="12" cy="12" r="1.5" fill="#E77731" stroke="#E77731" strokeWidth="1"/>
                  </svg>
                </div>
                
                <h3 className="text-[#00585E] text-[28px] font-bold text-center mb-2 tracking-[-0.5px]">
                  {isEmergency ? "How much do you earn monthly?" : (isPlanIN ? "What is your target?" : "What is your contribution?")}
                </h3>
                <p className="text-[#5A5A5A] text-[16px] text-center mb-8">
                  {isEmergency ? "Your emergency target is set to 3 times your monthly income" : (isPlanIN ? "Set a target amount for your goal." : "Set a contribution amount for your savings.")}
                </p>
                
                <div className="w-full">
                  {plan.id === 'custom' && !customName && (
                    <div className="mb-6">
                      <div className="mb-2 text-[#111111] font-bold text-[15px]"><Label name="Plan Name" /></div>
                      <div className="bg-[#EBEBEB] rounded-[16px] px-[20px] py-[16px] border border-[#E0E0E0] focus-within:border-[#E77731] focus-within:bg-white transition-all shadow-inner">
                        <Controller
                          name="planName"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="e.g. Dream Car, Vacation..."
                              className="bg-transparent w-full text-[18px] font-semibold text-[#111111] outline-none"
                            />
                          )}
                        />
                      </div>
                      {errors.planName && <p className="text-red-500 text-[13px] mt-2 font-medium pl-1">{errors.planName.message as string}</p>}
                    </div>
                  )}

                  {isEmergency && (
                    <div className="mb-2 text-[#111111] font-bold text-[15px] text-center block w-full"><Label name="What is your monthly salary" /></div>
                  )}

                  <div className={`bg-[#EBEBEB] rounded-[16px] px-[24px] py-[20px] flex items-center gap-3 mb-2 border transition-all shadow-inner ${errors.amount ? 'border-red-500 bg-[#FFF5F5]' : 'border-[#E0E0E0] focus-within:border-[#E77731] focus-within:bg-white'}`}>
                    <span className="text-[28px] font-bold text-[#5A5A5A]">₦</span>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <input
                          type="text"
                          {...rest}
                          value={value !== undefined && value !== null ? Number(value).toLocaleString() : ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, '');
                            if (!isNaN(Number(val))) onChange(val === '' ? undefined : Number(val));
                          }}
                          className={`bg-transparent w-full text-[28px] font-bold outline-none tracking-tight ${errors.amount ? 'text-red-500' : 'text-[#111111]'}`}
                          placeholder="100,000"
                        />
                      )}
                    />
                  </div>
                  <p className={`text-[13px] flex items-center gap-2 mb-8 pl-1 font-medium ${errors.amount ? 'text-red-500' : 'text-[#E77731]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${errors.amount ? 'bg-red-500' : 'bg-[#E77731]'}`}></span>
                    {errors.amount ? (errors.amount.message as string) : `Minimum amount is ₦${plan?.min_amount?.toLocaleString() || "1,000"}`}
                  </p>

                  <div className="flex gap-3 overflow-x-auto pb-2 mb-10 hide-scrollbar snap-x">
                    {(() => {
                      const base = Number((plan as any)?.target || plan?.min_amount || 50000);
                      return [base, base * 1.5, base * 3, base * 4.5];
                    })().map(amt => (
                      <button 
                        type="button" 
                        key={amt} 
                        onClick={() => setValue('amount', amt, { shouldValidate: true })}
                        className={`snap-start flex-shrink-0 border px-[20px] py-[12px] rounded-[16px] font-semibold transition-all shadow-sm active:scale-95 ${
                          Number(formData.amount) === amt 
                            ? 'bg-[#E77731] text-white border-[#E77731]' 
                            : 'bg-white text-[#5A5A5A] border-[#EBEBEB] hover:bg-[#FFF5F0] hover:text-[#E77731] hover:border-[#E77731]/30'
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#00383D] rounded-[24px] p-[24px] shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                           <div className="bg-white/10 p-3 rounded-[14px]">
                             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white" strokeWidth="2">
                               <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>
                             </svg>
                           </div>
                           <div>
                             <h4 className="text-white font-bold text-[16px] mb-0.5">Add Initial Deposit</h4>
                             <p className="text-white/60 text-[13px]">Kick-start your goal</p>
                           </div>
                        </div>
                        <ToggleSwitch 
                          checked={showInitialDeposit} 
                          onChange={(checked) => {
                            setShowInitialDeposit(checked);
                            if (!checked) {
                              setValue('initialAmount', undefined, { shouldValidate: true });
                            }
                          }} 
                        />
                      </div>
                      
                      <div className={`transition-all duration-300 overflow-hidden ${showInitialDeposit ? 'max-h-[100px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="border-t border-white/10 pt-5">
                          <div className={`flex items-center gap-3 bg-black/20 rounded-[12px] px-[16px] py-[14px] border transition-colors ${errors.initialAmount ? 'border-red-500' : 'border-white/5 focus-within:border-[#E77731]/50'}`}>
                            <span className="text-[18px] text-white/50 font-medium">₦</span>
                            <Controller
                              name="initialAmount"
                              control={control}
                              render={({ field: { value, onChange, ...rest } }) => (
                                <input
                                  type="text"
                                  {...rest}
                                  value={value !== undefined && value !== null ? Number(value).toLocaleString() : ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/,/g, '');
                                    if (!isNaN(Number(val))) onChange(val === '' ? undefined : Number(val));
                                  }}
                                  className={`bg-transparent w-full text-[18px] font-semibold outline-none placeholder-white/30 ${errors.initialAmount ? 'text-red-400' : 'text-white'}`}
                                  placeholder="Enter deposit amount"
                                />
                              )}
                            />
                          </div>
                          {errors.initialAmount ? (
                            <p className="text-red-400 text-[13px] mt-2 font-medium">{errors.initialAmount.message as string}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="mt-6 animate-fade-in flex flex-col items-center">
                <div className="bg-white w-[80px] h-[80px] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0F0F0] flex items-center justify-center mb-6">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E77731" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                
                <h3 className="text-[#00585E] text-[28px] font-bold text-center mb-2 tracking-[-0.5px]">When do you want to start?</h3>
                <p className="text-[#5A5A5A] text-[16px] text-center mb-8">Set your timeline.</p>

                <div className="w-full space-y-8">
                  <div>
                    <div className="mb-3 text-[#111111] font-bold text-[15px]"><Label name="Start Date" /></div>
                    <div className="bg-white rounded-[16px] p-2 shadow-sm border border-[#EBEBEB]">
                      <DatePickerInput name="startDate" control={control} label="" />
                    </div>
                  </div>

                  {!is100M65 && (() => {
                    const currentYear = parseInt(formData.year || "0", 10);
                    const currentMonth = parseInt(formData.month || "0", 10);
                    const minDur = plan?.min_duration || 0;
                    
                    const minYear = Math.max(0, Math.ceil((minDur - currentMonth) / 12));
                    const minMonth = Math.max(0, minDur - (currentYear * 12));

                    return (
                      <div>
                        <div className="mb-3 text-[#111111] font-bold text-[15px]"><Label name="Saving duration" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <Controller
                            name="year"
                            control={control}
                            render={({ field }) => (
                              <DurationCounter
                                label="Years"
                                value={field.value}
                                onChange={field.onChange}
                                min={minYear}
                                max={100}
                                unit="year"
                              />
                            )}
                          />
                          <Controller
                            name="month"
                            control={control}
                            render={({ field }) => (
                              <DurationCounter
                                label="Months"
                                value={field.value}
                                onChange={field.onChange}
                                min={minMonth}
                                max={11}
                                unit="month"
                              />
                            )}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  <div className="bg-[#00383D] rounded-[24px] p-[24px] shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10"></div>
                    {is100M65 && <h4 className="text-[#E77731] font-bold mb-6 text-[18px] relative z-10">This plan runs till you turn 65</h4>}
                    <div className={`flex justify-between relative z-10 ${is100M65 ? 'border-t border-white/10 pt-5' : ''}`}>
                       <div className="flex-1">
                         <p className="text-white/60 text-[13px] mb-2 font-medium">Duration</p>
                         <p className="text-white font-bold text-[18px]">
                           {is100M65 
                             ? `${yearsToRetirement} Years` 
                             : `${parseInt(formData.year || "0", 10)} Years${parseInt(formData.month || "0", 10) > 0 ? `, ${parseInt(formData.month || "0", 10)} Months` : ''}`}
                         </p>
                       </div>
                       <div className="w-[1px] bg-white/10 mx-4"></div>
                       <div className="flex-1">
                         <p className="text-white/60 text-[13px] mb-2 font-medium">Completion</p>
                         <p className="text-white font-bold text-[18px]">
                           {calculatorResult?.endDate ? new Date(calculatorResult.endDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : getMaturityDate()}
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="mt-6 animate-fade-in flex flex-col items-center">
                <div className="mb-8">
                  <div className="bg-[#F0FDF4] w-[80px] h-[80px] rounded-[24px] flex items-center justify-center border border-[#DCFCE7]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-[#00585E] text-[28px] font-bold text-center mb-2 tracking-[-0.5px]">Contribution Frequency</h3>
                <p className="text-[#5A5A5A] text-[16px] text-center mb-10">Choose how often you want to contribute.</p>

                <div className="w-full space-y-4">
                   {['daily', 'weekly', 'monthly'].map(freq => {
                     const isSelected = formData.frequency === freq;
                     return (
                       <button
                         key={freq}
                         type="button"
                         onClick={() => setValue('frequency', freq, { shouldValidate: true })}
                         className={`w-full py-[20px] px-[24px] rounded-[20px] font-bold text-[18px] transition-all duration-300 flex items-center justify-between group ${
                           isSelected
                           ? 'bg-white border-[2px] border-[#00585E] text-[#00585E] shadow-[0_8px_30px_rgba(0,88,94,0.12)]' 
                           : 'bg-[#F9F9F9] border-[2px] border-[#EBEBEB] text-[#5A5A5A] hover:bg-white hover:border-[#DCDCDC]'
                         }`}
                       >
                         {freq.charAt(0).toUpperCase() + freq.slice(1)}
                         <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-colors ${
                           isSelected ? 'border-[#00585E]' : 'border-[#DCDCDC] group-hover:border-[#C0C0C0]'
                         }`}>
                           {isSelected && <div className="w-3 h-3 rounded-full bg-[#00585E]"></div>}
                         </div>
                       </button>
                     );
                   })}
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="mt-6 animate-fade-in flex flex-col">
                <h3 className="text-[#00585E] text-[28px] font-bold mb-2 tracking-[-0.5px]">Review your goal</h3>
                <p className="text-[#5A5A5A] text-[16px] mb-8">Everything look good? Confirm to create your goal.</p>

                <div className="bg-[#002D36] rounded-t-[24px] p-[28px] shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
                   <h4 className="text-white text-[22px] font-bold mb-6 relative z-10">{plan.title}</h4>
                   <div className="flex border-t border-white/10 pt-6 relative z-10">
                     <div className="flex-1">
                       <p className="text-white/60 text-[13px] mb-2 font-medium">{isPlanIN ? "Target Amount" : "Contribution Amount"}</p>
                       <p className="text-white font-bold text-[20px]">₦{(isEmergency && formData.amount ? formData.amount * 3 : formData.amount)?.toLocaleString()}</p>
                     </div>
                     <div className="w-[1px] bg-white/10 mx-6"></div>
                     <div className="flex-1">
                       <p className="text-white/60 text-[13px] mb-2 font-medium">Duration</p>
                       <p className="text-white font-bold text-[20px]">{is100M65 ? `${yearsToRetirement} yr(s)` : `${parseInt(formData.year || "0", 10)} yr(s)${parseInt(formData.month || "0", 10) > 0 ? `, ${parseInt(formData.month || "0", 10)} mo(s)` : ''}`}</p>
                     </div>
                   </div>
                </div>
                
                <div className="bg-white rounded-b-[24px] p-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-x border-[#F0F0F0] space-y-6">
                   <div className="flex justify-between items-center border-b border-[#F5F5F5] pb-4">
                     <span className="text-[#5A5A5A] text-[15px] font-medium">Initial Deposit</span>
                     <span className="font-bold text-[#111111] text-[16px]">₦{formData.initialAmount?.toLocaleString() || 0}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-[#F5F5F5] pb-4">
                     <span className="text-[#5A5A5A] text-[15px] font-medium">Start Date</span>
                     <span className="font-bold text-[#111111] text-[16px]">{getStartDate()}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-[#F5F5F5] pb-4">
                     <span className="text-[#5A5A5A] text-[15px] font-medium">
                       {formData.frequency ? formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1) : "Monthly"} Contribution
                     </span>
                     <span className="font-bold text-[#111111] text-[16px]">₦{calculatorResult ? Number(calculatorResult.PMT).toLocaleString() : "0"}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-[#F5F5F5] pb-4">
                     <span className="text-[#5A5A5A] text-[15px] font-medium">Maturity Date</span>
                     <span className="font-bold text-[#111111] text-[16px]">{calculatorResult?.endDate ? new Date(calculatorResult.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : getMaturityDate()}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-[#F5F5F5] pb-4 bg-[#F0FDF4] -mx-[28px] px-[28px] py-4 mt-2">
                     <span className="text-[#00A859] text-[15px] font-bold">{isPlanIN ? "Target Amount" : "Total Contributions"}</span>
                     <span className="font-black text-[#00A859] text-[18px]">₦{isPlanIN ? formData.amount?.toLocaleString() : (calculatorResult ? Number(calculatorResult.total_contribution_amount).toLocaleString() : "0")}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-[#F5F5F5] pb-4 mt-4">
                     <span className="text-[#5A5A5A] text-[15px] font-medium">Interest Earned</span>
                     <span className="font-bold text-[#111111] text-[16px]">₦{calculatorResult ? Number(calculatorResult.interest_earned).toLocaleString() : "0"}</span>
                   </div>
                   <div className="flex justify-between items-center mt-4">
                     <span className="text-[#5A5A5A] text-[15px] font-medium">{isPlanIN ? "Total Contributions" : "Contribution Amount"}</span>
                     <span className="font-bold text-[#111111] text-[16px]">₦{isPlanIN ? (calculatorResult ? Number(calculatorResult.total_contribution_amount).toLocaleString() : "0") : formData.amount?.toLocaleString()}</span>
                   </div>
                </div>
                
                <div className="mt-8 mb-6 p-4 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] flex gap-3 items-start">
                  <div className="mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </div>
                  <p className="text-[#64748B] text-[13px] leading-relaxed">
                    Please note that funds are invested in the Chapel Hill Denham Mutual Funds and are subject to market conditions.
                  </p>
                </div>
                
                <div className="flex flex-col gap-1 mb-2 px-1">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="terms-checkbox"
                      type="checkbox" 
                      label={termsLink} 
                      checked={isTermsAccepted}
                      error={termsError ? "You must acknowledge the terms before proceeding" : undefined}
                      onChange={(e) => {
                        setIsTermsAccepted(e.target.checked);
                        if (e.target.checked) setTermsError(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

          {activeStep > 0 && (
            <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-[#F0F0F0] px-[20px] py-[16px] pb-[32px] md:pb-[20px] z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
              <div className="max-w-[552px] mx-auto flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 0 || (id === 'custom' && activeStep === 1)) navigate(-1);
                    else handleBack();
                  }}
                  className="w-[60px] h-[60px] flex items-center justify-center bg-white rounded-[16px] border border-[#EBEBEB] shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:bg-[#F9F9F9] transition-all flex-shrink-0"
                >
                  <i className="ri-arrow-left-line text-[#E77731] text-[24px]"></i>
                </button>

                <Button
                  variant="primary"
                  className="flex-1 rounded-[16px] h-[60px] text-[18px] font-bold bg-[#00585E] shadow-[0_8px_20px_rgba(0,88,94,0.2)] hover:shadow-[0_12px_24px_rgba(0,88,94,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 w-full"
                  onClick={() => {
                    if (activeStep < 4) {
                      handleNext();
                    } else {
                      if (!isTermsAccepted) {
                        setTermsError(true);
                        // Scroll to the checkbox so the error is fully visible
                        const checkbox = document.getElementById("terms-checkbox");
                        if (checkbox) {
                          checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      } else {
                        handleSubmit(onSubmit)();
                      }
                    }
                  }}
                  disabled={(activeStep === 1 && !formData.amount) || (activeStep === 3 && !formData.frequency) || (activeStep === 2 && !formData.startDate)}
                >
                  {activeStep === 4 ? "Confirm & Pay" : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeStep === 0 && otherPlans.length > 0 && (
        <div className="flex justify-center mt-[24px] px-[20px] pb-[80px]">
          <div className="w-full md:w-[600px] xl:w-[600px] lg:w-[600px]">
            <h4 className="text-[18px] font-bold text-[#0F0F0F] mb-[20px] text-center tracking-tight">Explore other plans</h4>
            {isPlansLoading ? (
              <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[210px] bg-[#F0F0F0] rounded-[20px]"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {otherPlans.map((p, idx) => {
                  const themes = [
                    { bg: "bg-[#FFF9F6]", border: "border-[#FFE4D6]", gradient: "group-hover:to-[#FFC9AB]/20" },
                    { bg: "bg-[#F4FAFF]", border: "border-[#D6E6FF]", gradient: "group-hover:to-[#A3CFFF]/20" },
                    { bg: "bg-[#F5FEF8]", border: "border-[#D4EDCC]", gradient: "group-hover:to-[#A5D895]/20" },
                    { bg: "bg-[#FCF5FF]", border: "border-[#F0D6FF]", gradient: "group-hover:to-[#D9A3FF]/20" },
                    { bg: "bg-[#FFFCF0]", border: "border-[#FFEBB3]", gradient: "group-hover:to-[#FFD666]/20" },
                  ];
                  
                  let hash = 0;
                  for (let i = 0; i < (p.name || "A").length; i++) {
                    hash = (p.name || "A").charCodeAt(i) + ((hash << 5) - hash);
                  }
                  const t = themes[Math.abs(hash) % themes.length];

                  return (
                    <div 
                      key={idx} 
                      onClick={() => navigate(`/app/save/drill-down/${p.id}`)}
                      className={`group flex flex-col items-center justify-between p-[20px] ${t.bg} border ${t.border} hover:border-transparent hover:shadow-[0_12px_32px_rgba(231,119,49,0.08)] rounded-[20px] cursor-pointer transition-all duration-400 ease-out hover:-translate-y-1 text-center h-[210px] relative overflow-hidden`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-transparent ${t.gradient} transition-colors duration-400 z-0`}></div>
                      
                      <div className="relative z-10 w-[50px] h-[50px] rounded-[14px] overflow-hidden mb-[12px] bg-white border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center transform transition-transform duration-500 ease-out group-hover:scale-110">
                        <img 
                          src={p.image || SaveIcon} 
                          alt={p.name} 
                          className="w-full h-full object-cover mix-blend-multiply" 
                          onError={(e) => { e.currentTarget.src = SaveIcon; }}
                        />
                      </div>
                      
                      <div className="relative z-10 w-full flex flex-col items-center flex-1">
                        <h3 className="text-[#111111] text-[15px] font-bold leading-[20px] truncate w-full group-hover:text-[#E77731] transition-colors duration-300">
                          {p.name}
                        </h3>
                        <p className="mt-[4px] text-[#5A5A5A] text-[11px] leading-[16px] line-clamp-2 w-full text-center">
                          {p.description}
                        </p>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {openPaymentGateway && (
        <PaymentGateway
          open={openPaymentGateway}
          setOpen={setOpenPaymentGateway}
          title={`Pay for ${formData.planName || plan?.title || "Plan"}`}
          fixedAmount={Number(formData.initialAmount) > 0 ? Number(formData.initialAmount) : parseFloat(calculatorResult?.PMT?.replace(/,/g, '') || '0')}
          walletBalance={walletBalance}
          savedCards={savedCards}
          availablePartners={availablePartners}
          configs={paymentGatewayConfigs}
          currency="NGN"
          isSubmitting={isSubmittingPayment}
          isLoadingConfigs={isLoadingConfigs}
          onRefresh={fetchPaymentConfigs}
          onContinue={handlePaymentContinue}
        />
      )}

      {openPaymentSuccess && (
        <PaymentSuccess
          open={openPaymentSuccess}
          setOpen={(open) => {
            setOpenPaymentSuccess(open);
            if (!open) {
              navigate(-1);
            }
          }}
          amount={Number(formData.initialAmount) > 0 ? Number(formData.initialAmount) : parseFloat(calculatorResult?.PMT?.replace(/,/g, '') || '0')}
          currency="NGN"
          title="Save Plan created successfully"
        />
      )}
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKyc}
        setAdditionalKycDialog={setOpenAdditionalKyc}
      />
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      </div>
    </Portal>
  );
};

export default SavePlanDrilldown;
