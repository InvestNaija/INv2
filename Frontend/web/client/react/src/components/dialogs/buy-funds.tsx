import { Dialog, Stepper, type DialogProps } from "@mui/material";
import AssetIcon from "../../assets/icons/fund-icon.svg";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "../atoms/buttons";
import formatCurrency from "../../hooks/FormatCurrency";
import { useState, useEffect, useMemo, useRef } from "react";
import PaymentGateway from "./payment-gateway";
import PaymentSuccess from "./payment-success";
import { toast } from "react-toastify";
import type { FundAssetDetail } from "../../models/fundAssetModel";
import type { Portfolio } from "../../models/portfolioModel";
import { useInvestment } from "../../contexts/investmentsContext";
import { useWalletFeatures } from "../../contexts/walletContext";
import type { SavedCard, PaymentGatewayConfig } from "../../models/walletModel";
import { useUser } from "../../contexts/userContext";
import AdditionalKyc from "./additional-kyc";
import AccountVerification from "./account-verification";
import getVerificationMessage from "../../hooks/getVerificationMessage";
import isKycComplete from "../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../hooks/isAdditionalKycComplete";

interface BuyFundProps {
  setBuyFundDialog: (open: boolean) => void;
  openBuyFundDialog: boolean;
  assetDetails?: FundAssetDetail | null;
  selectedPortfolio?: Portfolio | null;
}

interface BuyFormValues {
  amount: number;
}

const BuyFunds = (props: BuyFundProps) => {
  const { currentUser } = useUser();
  const { subscribeFund, initPayment, isSubscribing, isInitiatingPayment } = useInvestment();
  const { fetchPaymentGatewayOptions, fetchGatewaySavedCards, balance: walletContextBalance } = useWalletFeatures();
  const [activeStep, setActiveStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Payment Gateway State
  const [openPaymentGateway, setOpenPaymentGateway] = useState(false);
  const [openPaymentSuccess, setOpenPaymentSuccess] = useState(false);
  const [availablePartners, setAvailablePartners] = useState<string[]>([]);
  const [paymentGatewayConfigs, setPaymentGatewayConfigs] = useState<PaymentGatewayConfig[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [displayAmount, setDisplayAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const nameLower = (props.assetDetails?.name || "").toLowerCase();
  const codeLower = (props.assetDetails?.asset_code || "").toLowerCase();
  const isFgsb = nameLower.includes("fgsb") || codeLower.includes("fgsb") || nameLower.includes("fgn savings bond") || nameLower.includes("savings bond") || nameLower.includes("fgn");
  const [resident, setResident] = useState<boolean>(true);
  const [tenor, setTenor] = useState<string>("2");

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const multiple = Number(props.assetDetails?.subsequentMultipleUnit || 1);
  const unitPrice = Number(props.assetDetails?.offerPrice ?? props.assetDetails?.sharePrice ?? props.assetDetails?.currentValue ?? 0);
  const multipleAmount = multiple * unitPrice;
  const minAmount = multipleAmount;

  const maxAmountStr = props.assetDetails?.anticipatedMaxPrice;
  const maxAmount = maxAmountStr ? Number(maxAmountStr) : undefined;
  const yieldPercent = props.assetDetails?.yield || 0;

  const dynamicFundSchema = useMemo(() => {
    let amountSchema = yup
      .number()
      .typeError("Amount must be a number")
      .positive("Amount must be greater than zero")
      .min(minAmount, `Minimum investment is ${formatCurrency(minAmount, props.assetDetails?.currency || "NGN", "en-NG")}`)
      .required("Amount is required")
      .test("is-multiple", `Amount must be a multiple of ${props.assetDetails?.currency === 'USD' ? '$' : '₦'}${multipleAmount.toLocaleString("en-US")}`, (value) => {
        if (!value || !multipleAmount) return true;
        if (multiple <= 1) return true;
        const remainder = value % multipleAmount;
        // Handle floating point inaccuracies
        return remainder < 0.0001 || Math.abs(remainder - multipleAmount) < 0.0001;
      });

    if (maxAmount && maxAmount > 0) {
      amountSchema = amountSchema.max(maxAmount, `Maximum investment is ${formatCurrency(maxAmount, props.assetDetails?.currency || "NGN", "en-NG")}`);
    }

    return yup.object().shape({
      amount: amountSchema,
    });
  }, [multiple, minAmount, multipleAmount, maxAmount, props.assetDetails?.currency]);

  const staticAmountPrice: number[] = [1000, 5000, 10000, 50000, 100000];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<BuyFormValues>({
    resolver: yupResolver(dynamicFundSchema),
    mode: "onChange",
  });

  const watchAmount = watch("amount", 0);
  const estimatedUnits = unitPrice > 0 ? watchAmount / unitPrice : 0;
  const assetName = props.assetDetails?.name || "Money Market Fund (MMF)";
  const assetCode = props.assetDetails?.asset_code || "CHDMMF";
  const assetImage = props.assetDetails?.logo || props.assetDetails?.image || AssetIcon;

  useEffect(() => {
    const numericDisplay = Number(displayAmount.replace(/,/g, ""));
    if (watchAmount !== numericDisplay) {
      setDisplayAmount(watchAmount ? watchAmount.toLocaleString("en-US") : "");
    }
  }, [watchAmount, displayAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: any) => void) => {
    const rawValue = e.target.value.replace(/,/g, "");

    if (rawValue === "" || !/^\d*\.?\d*$/.test(rawValue)) {
      if (rawValue === "") {
        setDisplayAmount("");
        onChange(undefined);
      }
      return;
    }

    if (rawValue.includes(".")) {
      const parts = rawValue.split(".");
      parts[0] = parts[0] ? Number(parts[0]).toLocaleString("en-US") : "0";
      setDisplayAmount(parts.join("."));
    } else {
      setDisplayAmount(Number(rawValue).toLocaleString("en-US"));
    }

    onChange(Number(rawValue));
  };

  const updateAmount = (amount: number) => {
    setValue("amount", amount, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleClose = () => {
    props.setBuyFundDialog(false);
    setActiveStep(0);
    setAgreed(false);
    reset();
  };

  const fetchPaymentConfigs = () => {
    if (!props.assetDetails?.asset_id) return;

    setIsLoadingConfigs(true);
    fetchPaymentGatewayOptions("invest", props.assetDetails.asset_id)
      .then((res) => {
        const partners = res.data.map((conf) => conf.gateway);
        setAvailablePartners(partners);
        setPaymentGatewayConfigs(res.data);
      })
      .catch((err) => {
        console.error("Failed to load gateways", err);
        toast.error("Failed to load payment options.");
      })
      .finally(() => setIsLoadingConfigs(false));

    if (currentUser?.id) {
      fetchGatewaySavedCards(currentUser.id)
        .then((res) => setSavedCards(res.data))
        .catch(() => { });
    }

    setWalletBalance(walletContextBalance);
  };

  useEffect(() => {
    if (!openPaymentGateway) return;
    fetchPaymentConfigs();
  }, [openPaymentGateway, props.assetDetails?.asset_id, currentUser?.id]);

  const onSubmit = async () => {
    handleNext();
  };

  const handlePaymentContinue = async (
    amount: number,
    method: string,
    partner?: string,
    cardId?: string,
    receiptFile?: File
  ) => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    if (!props.assetDetails || !props.selectedPortfolio) {
      toast.error("Missing asset or portfolio data.");
      return;
    }

    setIsSubmitting(true);
    try {
      const assetId = props.assetDetails.asset_id;
      const selectedConfig = paymentGatewayConfigs.find(c => c.gateway === (partner || "paystack")) || paymentGatewayConfigs[0];
      const gatewayId = selectedConfig?.id;
      const redirectUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const isNewCardPayment = method === "payment_partners" && !cardId;

      const payload: any = {
        paymentMethod: method === "wallet" ? "wallet" : "online",
        gateway: method === "wallet" ? "wallet" : (method === "direct_transfer" ? "banktransfer" : (partner || "paystack")),
        id: assetId,
        asset_quantity: estimatedUnits,
        amount: watchAmount,
        transAmount: watchAmount,
        description: `New deposit for ${assetCode}`,
        type: "debit",
        asset_type: "FUND",
        fundName: assetCode,
        orderBase: "VALUE",
        transType: "SUBSCRIPTION",
        portfolioId: props.selectedPortfolio.id,
        portfolioName: props.selectedPortfolio.name,
        redirect_url: redirectUrl,
        currency: props.assetDetails.currency || "NGN",
        assetName: assetCode,
        post_url: `${import.meta.env.VITE_BASE_URL}/investin/funds/subscription`,
        callback_params: {
          module: "invest",
          resident: isFgsb ? resident : true,
          tenor: isFgsb ? tenor : "2",
          asset_id: assetId,
          ...(isNewCardPayment ? { gateway_id: gatewayId } : {}),
          saveCard: method === "payment_partners" && !cardId,
          brokerageInfo: {}
        },
        gatewayEndpoints: `${import.meta.env.VITE_BASE_URL}/3rd-party-services/gateway?modules=invest&id=${assetId}`,
        ...(cardId ? { payment_type: "saved_card", saved_card_id: cardId } : {}),
        ...(isNewCardPayment ? {
          gateway_id: gatewayId,
          channel: partner || "paystack",
          channels: ["card", "bank_transfer"]
        } : {}),
        ...(method === "direct_transfer" ? { channel: "banktransfer" } : {})
      };

      let finalPayload: any = payload;

      if (receiptFile) {
        if (props.assetDetails?.currency === "USD" && method === "direct_transfer") {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          });
          formData.append("image", receiptFile);
          finalPayload = formData;
        } else {
          const reader = new FileReader();
          reader.readAsDataURL(receiptFile);
          await new Promise<void>((resolve, reject) => {
            reader.onload = () => {
              payload.receiptFileBase64 = reader.result;
              resolve();
            };
            reader.onerror = (error) => reject(error);
          });
          finalPayload = payload;
        }
      }

      let response;
      if (props.assetDetails?.currency === "USD" && method === "direct_transfer") {
        response = await initPayment(finalPayload, props.selectedPortfolio.signature);
      } else {
        response = await subscribeFund(finalPayload, props.selectedPortfolio.signature);
      }

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
        toast.error("Complete your KYC to proceed");
        setOpenAdditionalKyc(true);
        return;
      }
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to process subscription";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={props.openBuyFundDialog}
        onClose={handleClose}
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
              padding: "34px 24px",
              height: "100vh !important",
              maxHeight: "100vh !important",
              position: "absolute",
              top: "0",
              right: "0",
              margin: "0",
              width: "100%",
              maxWidth: "480px",
            },
          },
          transition: {
            // MUI's Dialog manages focus itself once its enter transition
            // finishes, which can steal focus back from the input's native
            // `autoFocus` — focusing imperatively here, after that
            // transition settles, is what actually lands the cursor.
            onEntered: () => amountInputRef.current?.focus(),
          },
        }}
      >
        <Stepper activeStep={activeStep}></Stepper>

        {activeStep === 0 && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div
                className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-[#FAFAFA] border border-[#F0F0F0]"
                onClick={() => props.setBuyFundDialog(false)}
              >
                <i className="ri-arrow-left-s-line text-[24px] text-[#0F0F0F]"></i>
              </div>
              <h3 className="text-[18px] font-bold text-[#0F0F0F]">Invest</h3>
              <div className="w-[40px]"></div>
            </div>

            <div className="mt-[40px] flex items-center gap-[16px]">
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[12px] bg-[#00585E] text-white font-bold overflow-hidden">
                <img
                  src={assetImage}
                  alt="Asset Icon"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-[12px]">${assetCode}</span>`;
                  }}
                />
              </div>
              <div>
                <h3 className="text-[#0F0F0F] text-[16px] font-semibold">{assetName}</h3>
                <div className="flex gap-[8px] mt-[6px]">
                  <span className="bg-[#E7F6E7] text-[#0A7A43] text-[12px] px-[8px] py-[4px] rounded-[6px] font-bold">{yieldPercent}% yield</span>
                  <span className="bg-[#EAF5FA] text-[#00585E] text-[12px] px-[8px] py-[4px] rounded-[6px] font-bold">
                    {formatCurrency(minAmount, props.assetDetails?.currency || "NGN", "en-NG")} Min Investment
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-[60px] flex flex-col flex-1 justify-between">
              <form className="flex flex-col flex-1" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <div className="flex justify-center border-b border-[#F0F0F0] pb-[16px]">
                    <div className="flex items-start justify-center">
                      <span className="text-[24px] font-bold text-[#8C8C8C] mt-[8px] mr-[2px]">{props.assetDetails?.currency === 'USD' ? '$' : '₦'}</span>
                      <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                          <input
                            ref={amountInputRef}
                            type="text"
                            value={displayAmount}
                            onBlur={field.onBlur}
                            onChange={(e) => handleAmountChange(e, field.onChange)}
                            autoFocus
                            className="text-center text-[48px] font-bold text-[#0F0F0F] bg-transparent border-none outline-none focus:ring-0 placeholder:text-[#DCDCDC] leading-[1] caret-[#00585E]"
                            style={{ width: `${Math.max((displayAmount || "").length, 4)}ch` }}
                            placeholder="1000"
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors.amount && (
                    <p className="mt-[8px] text-center text-[13px] text-red-500">{errors.amount.message}</p>
                  )}

                  <div className="flex flex-wrap justify-center gap-[12px] mt-[32px]">
                    {staticAmountPrice.map((price, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => updateAmount(price)}
                        className={`cursor-pointer rounded-[99px] px-[16px] py-[10px] text-center text-[13px] font-bold transition-all duration-150 border ${watchAmount === price
                          ? "border-[#00585E] bg-[#00585E] text-white shadow-[0_4px_14px_rgba(0,88,94,0.3)]"
                          : "border-[#DCDCDC] bg-transparent text-[#5A5A5A] hover:border-[#00585E] hover:text-[#00585E]"
                          }`}
                      >
                        {formatCurrency(price, props.assetDetails?.currency || "NGN", "en-NG")}
                      </button>
                    ))}
                  </div>

                  {isFgsb && (
                    <div className="mt-[28px] flex flex-col gap-[20px] rounded-[16px] border border-[#F0F0F0] p-[20px] bg-[#FAFAFA]">
                      <div>
                        <label className="text-[13px] font-bold text-[#5A5A5A] mb-[10px] block">Resident Status</label>
                        <div className="flex gap-[12px]">
                          <button
                            type="button"
                            onClick={() => setResident(true)}
                            className={`flex-1 cursor-pointer rounded-[12px] border-2 py-[12px] text-[14px] font-bold transition-all duration-150 ${resident ? "border-[#00585E] bg-[#EAF5FA] text-[#00585E]" : "border-[#DCDCDC] text-[#5A5A5A] bg-white hover:border-[#00585E]"}`}
                          >
                            Resident
                          </button>
                          <button
                            type="button"
                            onClick={() => setResident(false)}
                            className={`flex-1 cursor-pointer rounded-[12px] border-2 py-[12px] text-[14px] font-bold transition-all duration-150 ${!resident ? "border-[#00585E] bg-[#EAF5FA] text-[#00585E]" : "border-[#DCDCDC] text-[#5A5A5A] bg-white hover:border-[#00585E]"}`}
                          >
                            Non-Resident
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[13px] font-bold text-[#5A5A5A] mb-[10px] block">Tenor</label>
                        <div className="flex gap-[12px]">
                          <button
                            type="button"
                            onClick={() => setTenor("2")}
                            className={`flex-1 cursor-pointer rounded-[12px] border-2 py-[12px] text-[14px] font-bold transition-all duration-150 ${tenor === "2" ? "border-[#00585E] bg-[#EAF5FA] text-[#00585E]" : "border-[#DCDCDC] text-[#5A5A5A] bg-white hover:border-[#00585E]"}`}
                          >
                            2 Years
                          </button>
                          <button
                            type="button"
                            onClick={() => setTenor("3")}
                            className={`flex-1 cursor-pointer rounded-[12px] border-2 py-[12px] text-[14px] font-bold transition-all duration-150 ${tenor === "3" ? "border-[#00585E] bg-[#EAF5FA] text-[#00585E]" : "border-[#DCDCDC] text-[#5A5A5A] bg-white hover:border-[#00585E]"}`}
                          >
                            3 Years
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-[40px]">
                  <div className="flex justify-between items-center mb-[32px]">
                    <div>
                      <span className="flex items-center gap-[6px] text-[12px] font-bold text-[#5A5A5A]">
                        <i className="ri-pie-chart-line text-[16px]"></i> You'd receive
                      </span>
                      <span className="block text-[#00585E] text-[18px] font-bold mt-[4px]">{estimatedUnits.toFixed(2)} Unit(s)</span>
                    </div>
                    <div className="w-[1px] h-[40px] bg-[#F0F0F0]"></div>
                    <div className="text-right">
                      <span className="flex items-center gap-[6px] justify-end text-[12px] font-bold text-[#5A5A5A]">
                        <i className="ri-price-tag-3-line text-[16px]"></i> Unit Price
                      </span>
                      <span className="block text-[#0F0F0F] text-[18px] font-bold mt-[4px]">{formatCurrency(unitPrice, props.assetDetails?.currency || "NGN", "en-NG", 6)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!watchAmount || !!errors.amount}
                    isLoading={false}
                    className="rounded-[12px] h-[56px] w-full"
                  >
                    Review Investment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div
                className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-[#FAFAFA] border border-[#F0F0F0]"
                onClick={handleBack}
              >
                <i className="ri-arrow-left-s-line text-[24px] text-[#0F0F0F]"></i>
              </div>
              <h3 className="text-[18px] font-bold text-[#0F0F0F]">Review</h3>
              <div className="w-[40px]"></div>
            </div>

            <div className="mt-[40px] flex flex-col flex-1 justify-between">
              <div>
                <div className="bg-[#F8FAFC] rounded-[24px] p-[32px] flex flex-col items-center border border-[#F0F4F8]">
                  <span className="bg-[#E4F2F3] text-[#00585E] text-[11px] font-bold px-[12px] py-[6px] rounded-[999px] uppercase tracking-[1px] mb-[24px]">
                    Transaction Summary
                  </span>
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[16px] bg-[#00585E] text-white font-bold mb-[24px] overflow-hidden">
                    <img
                      src={assetImage}
                      alt="Asset Icon"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-[14px]">${assetCode}</span>`;
                      }}
                    />
                  </div>
                  <h3 className="text-[#1D2B36] text-[22px] font-bold text-center">{assetName}</h3>
                </div>

                <div className="mt-[40px] flex flex-col gap-[24px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5A5A5A] text-[15px] font-medium">Amount</span>
                    <span className="text-[#0F0F0F] text-[16px] font-bold">{formatCurrency(watchAmount, props.assetDetails?.currency || "NGN", "en-NG")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5A5A5A] text-[15px] font-medium">Unit Price</span>
                    <span className="text-[#0F0F0F] text-[16px] font-bold">{formatCurrency(unitPrice, props.assetDetails?.currency || "NGN", "en-NG", 6)}</span>
                  </div>
                  <div className="w-full h-[1px] bg-[#F0F0F0] my-[4px]"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0F0F0F] text-[15px] font-bold">Estimated Units</span>
                    <span className="text-[#0F0F0F] text-[16px] font-bold">{estimatedUnits} Units</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-[40px]">
                <label className="flex items-start gap-[12px] cursor-pointer mb-[32px]">
                  <div className="pt-[2px]">
                    <input
                      type="checkbox"
                      className="w-[20px] h-[20px] rounded-[4px] border-[#DCDCDC] text-[#00585E] focus:ring-[#00585E]"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                  </div>
                  <span className="text-[#5A5A5A] text-[13px] leading-[20px] font-medium">
                    I agree to the terms of this investment and understand that past performance is not always indicative of future returns.
                  </span>
                </label>

                <Button
                  variant="primary"
                  disabled={!agreed}
                  isLoading={false}
                  onClick={() => setShowConfirmation(true)}
                  className="rounded-[12px] h-[56px] w-full"
                >
                  Invest
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        slotProps={{
          backdrop: {
            sx: { backdropFilter: "blur(0px)", opacity: "0.5" },
          },
          paper: {
            sx: {
              backgroundColor: "var(--surface-default, #FFFFFF)",
              borderRadius: "24px",
              width: { xs: "100%", sm: "420px" },
              maxWidth: "calc(100% - 32px)",
              margin: { xs: "16px", sm: "32px" },
              padding: { xs: "32px 20px", sm: "40px 32px" },
              textAlign: "center",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
            },
          },
        }}
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-[#EBF4F5] mb-[20px]">
            <i className="ri-information-line text-[24px] text-[#00585E]"></i>
          </div>
          <h3 className="text-[20px] font-bold text-[var(--text-content-default)] mb-[12px] tracking-tight">
            Kindly Note
          </h3>
          <p className="text-[15px] font-medium leading-[24px] text-[#344A4C] mb-[36px]">
            {assetCode === "CHDNDIF"
              ? "Please note that this transaction will be processed in 3 to 5 days."
              : "Please note that this transaction will be processed on the next business day."}
          </p>
          <div className="flex gap-[16px] w-full">
            <Button
              type="button"
              variant="empty"
              className="!w-auto flex-1 rounded-[16px] h-[52px] border border-[#9EB4B5] !text-[#00585E]"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="!w-auto flex-1 rounded-[16px] h-[52px]"
              onClick={() => {
                setShowConfirmation(false);
                setOpenPaymentGateway(true);
              }}
            >
              Proceed
            </Button>
          </div>
        </div>
      </Dialog>

      {openPaymentGateway && (
        <PaymentGateway
          open={openPaymentGateway}
          setOpen={setOpenPaymentGateway}
          title={`Pay for ${assetCode}`}
          fixedAmount={watchAmount}
          walletBalance={walletBalance}
          savedCards={savedCards}
          availablePartners={availablePartners}
          configs={paymentGatewayConfigs}
          currency={props.assetDetails?.currency || "NGN"}
          isSubmitting={isSubmitting || isSubscribing || isInitiatingPayment}
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
              props.setBuyFundDialog(false);
              setActiveStep(0);
              reset();
            }
          }}
          amount={watchAmount || 0}
          currency={props.assetDetails?.currency || "NGN"}
          title="Subscription request submitted"
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
    </>
  );
};

export default BuyFunds;

