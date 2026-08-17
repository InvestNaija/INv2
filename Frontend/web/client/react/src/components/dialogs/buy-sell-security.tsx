import { Dialog, Stepper, CircularProgress, Tooltip, type DialogProps } from "@mui/material";
import StockIcon from "../../assets/icons/airtel.svg";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { toast } from "react-toastify";
import Input from "../atoms/input";
import Button from "../atoms/buttons";
import formatCurrency from "../../hooks/FormatCurrency";
import { useEffect, useState } from "react";
import { buySecuritySchema } from "../../features/ui/invest/trade/details/stocks-validators";
import Label from "../atoms/labels";
import FormSelect from "../atoms/select";
import type { SelectOption } from "../atoms/select";
import { useTrade } from "../../contexts/tradeContext";
import type { TradeOrderPriceCalculation, OrderTerm } from "../../models/tradeModel";
import type { Portfolio } from "../../models/portfolioModel";
import OrderSuccess from "./order-success";
import AdditionalKyc from "./additional-kyc";
import AccountVerification from "./account-verification";
import getVerificationMessage from "../../hooks/getVerificationMessage";
import isKycComplete from "../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../hooks/isAdditionalKycComplete";
import { useUser } from "../../contexts/userContext";

interface BuySecuritySelected {
  secDesc: string;
  symbol: string;
  imageUrl: string | null;
  price: number;
}

interface BuySecurityProps {
  setBuySecurityDialog: (open: boolean) => void;
  openBuySecurityDialog: boolean;
  orderType: string;
  security: BuySecuritySelected;
  // The trade portfolio's purchasing power (margin trading power, or
  // available cash for a regular account) — shown as "Buying power" and
  // caps how much can be spent on a Buy order.
  buyingPower: number;
  // The user's current holding quantity for this security — shown as
  // "Available units" and caps how many units can be sold on a Sell order.
  availableUnits: number;
  // The selected trade portfolio — supplies the account/signature fields
  // POST /trades/trade-order/create needs. Order submission is disabled
  // until this has loaded.
  portfolio: Portfolio | null;
}

const ORDER_TERM_INFO: Record<string, { title: string; description: string }> = {
  "GOOD FOR THE DAY": {
    title: "Good For The Day",
    description:
      "This trade is only valid for one trading day (9:00am to 4:00pm - Monday to Friday excluding public holidays). If the trade is not executed within the trading period, it will expire and you have to enter it again on the next trading day.",
  },
  "GOOD TILL CANCEL": {
    title: "Good Till Cancel",
    description:
      "This trade stays active until it is fully executed or you cancel it — it does not expire at the end of the trading day.",
  },
};

// Short form of the order term for the Review step (e.g. "Good for Day"),
// distinct from ORDER_TERM_INFO's longer title used in the step-0 info box.
const TERM_DISPLAY: Record<string, string> = {
  "GOOD FOR THE DAY": "Good for Day",
  "GOOD TILL CANCEL": "Good till Cancelled",
};

const BUY_FORM_ID = "buy-sell-security-form";

const BuySellSecurity = (props: BuySecurityProps) => {
  const { security, buyingPower, availableUnits, portfolio } = props;
  const isSell = props.orderType === "Sell";
  const [activeStep, setActiveStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { submitTradeOrder, fetchOrderTerms, calculateOrderPrice, isCreatingOrder: isSubmittingOrder, isCalculatingPrice } = useTrade();
  const [openOrderSuccess, setOpenOrderSuccess] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const { currentUser } = useUser();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const staticUnitPrice: number[] = [10, 100, 200, 500, 1000];

  const updateUnitPrice = (unit: number) => {
    setValue("unit", unit, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const priceTypeOptions: SelectOption[] = [
    { value: "", label: "Select order type" },
    {
      value: "market",
      label: "Market Price",
      description: `${isSell ? "Sell" : "Buy"} at the official market price`,
    },
    {
      value: "limit",
      label: "Limit Price",
      description: "Set your own price for this order",
    },
  ];

  // Populated live from GET /trades/order-terms — each option's value is the
  // term's `label` (what's shown/selected in the form and used to key
  // ORDER_TERM_INFO/TERM_DISPLAY); the matching `name` code is looked up
  // separately at submit time for `orderTermName`.
  const [orderTerms, setOrderTerms] = useState<OrderTerm[]>([]);

  useEffect(() => {
    const getTerms = async () => {
      try {
        const data = await fetchOrderTerms();
        setOrderTerms(data.result);
      } catch (error) {
        // Error handling is managed by context, but we can also display toasts here if not handled globally.
        // Actually, context throws the error so we can catch it.
        toast.error(error as string);
      }
    };

    getTerms();
    // fetchOrderTerms dispatches on the shared TradeProvider reducer, so it
    // gets recreated (new reference) every time that provider re-renders —
    // depending on it here would refire this effect every time, which
    // dispatches again, which re-renders the provider again, forever. Same
    // reason useWatchlist's fetch effect omits its context function too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderTermOptions: SelectOption[] = [
    { value: "", label: "Select order term" },
    ...orderTerms.map((term) => ({ value: term.label, label: term.label })),
  ];

  const handleClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      props.setBuySecurityDialog(false);
    }
  };

  // initialize the form with react hook form and yup resolver for validation
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(buySecuritySchema),
    mode: "onChange",
    // Both selects render as MUI `Select`s, which warn ("out-of-range
    // value `undefined`") unless their controlled value matches one of the
    // option values from the first render — "" is a real option here (the
    // "Select order type/term" placeholder) so the field starts genuinely
    // unset instead of being silently pre-picked for the user, while still
    // satisfying MUI's controlled-value requirement. The yup `.required()`
    // rules on these fields mean submitting with "" is blocked until the
    // user actually chooses something.
    defaultValues: {
      priceType: "",
      orderTerm: "",
    },
  });

  const selectedOrderTerm = watch("orderTerm");
  const orderTermInfo = ORDER_TERM_INFO[selectedOrderTerm as string];
  const selectedPriceType = watch("priceType");
  const quantity = watch("unit") || 0;

  // Kept outside react-hook-form (plain state) — it's only conditionally
  // required (when priceType is "limit"), and mixing a conditionally-typed
  // field into the yup-driven form breaks the shared FormSelect component's
  // Control<T> typing. Validated manually in onSubmit instead.
  //
  // Held as raw text rather than a number: parsing every keystroke with
  // Number() and feeding it straight back into a controlled `value` is what
  // caused the field to get stuck showing "NaN" whenever the input passed
  // through an intermediate state Number() can't parse (e.g. a bare "."
  // while typing a decimal) — the DOM value has to be able to hold exactly
  // what the user typed at all times.
  const [limitPriceInput, setLimitPriceInput] = useState("");
  const [limitPriceError, setLimitPriceError] = useState<string | undefined>();

  const parsedLimitPrice = Number(limitPriceInput);
  const limitPrice =
    limitPriceInput !== "" && Number.isFinite(parsedLimitPrice)
      ? parsedLimitPrice
      : undefined;

  // The security's real market price is always sent as `marketPrice`; the
  // price actually used for cost calculations/display is the user-entered
  // limit price once "limit" is picked — left blank for the user to fill
  // in themselves rather than prefilled with the market price.
  const effectivePrice =
    selectedPriceType === "limit" ? limitPrice || 0 : security.price;

  // Real fees/consideration/total from the trade-order price calculator,
  // debounced so it doesn't fire on every keystroke while typing the unit
  // amount. Falls back to a naive quantity × price estimate until the first
  // calculation lands (or if it fails).
  const [priceCalculation, setPriceCalculation] =
    useState<TradeOrderPriceCalculation | null>(null);

  useEffect(() => {
    if (
      !quantity ||
      quantity <= 0 ||
      !selectedPriceType ||
      (selectedPriceType === "limit" && !effectivePrice)
    ) {
      setPriceCalculation(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await calculateOrderPrice({
          quantityRequested: quantity,
          marketPrice: security.price,
          limitPrice: effectivePrice,
          orderType: props.orderType.toUpperCase() as "BUY" | "SELL",
          priceType: selectedPriceType.toUpperCase() as "MARKET" | "LIMIT",
        });
        setPriceCalculation(data);
      } catch (error) {
        toast.error(error as string);
        setPriceCalculation(null);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [quantity, selectedPriceType, effectivePrice, props.orderType, security.price, calculateOrderPrice]);

  // Guard against NaN when quantity is 0 (nothing typed yet) or
  // effectivePrice isn't a real number yet (e.g. security price still
  // loading, or an in-progress limit price) — falls back to 0 rather than
  // letting `0 * undefined`/`NaN` leak into the UI.
  const estimatedTotal =
    priceCalculation?.amount ??
    (quantity > 0 && Number.isFinite(effectivePrice)
      ? quantity * effectivePrice
      : 0);
  // A Buy is capped by available cash (buying power); a Sell is capped by
  // how many units of the security are actually held.
  const exceedsBuyingPower = isSell
    ? quantity > 0 && quantity > availableUnits
    : quantity > 0 && estimatedTotal > buyingPower;

  // Handle form submission — yup's schema-level validation already ran via
  // handleSubmit before this is called; limitPrice lives outside the form
  // so it's checked manually here.
  const onSubmit = async () => {
    if (selectedPriceType === "limit" && !limitPrice) {
      setLimitPriceError("Limit price is required");
      return;
    }
    setLimitPriceError(undefined);
    handleNext();
  };

  // Submits the order for real (POST /trades/trade-order/create), using the
  // account/signature fields from the selected portfolio.
  const handleConfirmOrder = async () => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    if (!portfolio) {
      toast.error("No portfolio selected — please try again.");
      return;
    }

    const matchedOrderTerm = orderTerms.find(
      (term) => term.label === selectedOrderTerm,
    );
    if (!matchedOrderTerm) {
      toast.error("No order term selected — please try again.");
      return;
    }

    try {
      await submitTradeOrder({
        securityName: security.symbol,
        priceType: selectedPriceType.toUpperCase() as "MARKET" | "LIMIT",
        limitPrice: effectivePrice,
        marketPrice: security.price,
        orderType: props.orderType.toUpperCase() as "BUY" | "SELL",
        orderOrigin: "WEB",
        orderDate: Date.now(),
        quantityRequested: quantity,
        orderCurrency: "NGN",
        orderTermName: matchedOrderTerm.name,
        estimatedAmount: estimatedTotal.toFixed(2),
        cashAccountId: portfolio.cashAccountId,
        portfolioName: portfolio.name,
        signature: portfolio.signature,
        portfolioId: portfolio.portfolioId,
      });

      // Reset for next time this dialog is opened, then show success.
      setActiveStep(0);
      setAgreedToTerms(false);
      setLimitPriceInput("");
      props.setBuySecurityDialog(false);
      setOpenOrderSuccess(true);
    } catch (error) {
      const verificationMessage = getVerificationMessage(error);
      if (verificationMessage) {
        toast.error("Complete your KYC to proceed");
        setOpenAdditionalKyc(true);
        return;
      }
      toast.error(error as string);
    }
  };

  return (
    <>
    <Dialog
      open={props.openBuySecurityDialog}
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
            height: "100vh !important",
            maxHeight: "100vh !important",
            width: "480px",
            maxWidth: "100%",
            position: "absolute",
            top: "0",
            right: "0",
            margin: "0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      <Stepper activeStep={activeStep} sx={{ display: "none" }} />

      {activeStep === 0 && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Fixed: close button + security header */}
          <div className="shrink-0 px-[24px] pt-[24px]">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => props.setBuySecurityDialog(false)}
                className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px]"
              >
                <i className="ri-close-fill text-[24px] leading-[28px]"></i>
              </button>
            </div>

            <div className="mt-[32px] flex flex-col items-center">
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-white-500 overflow-hidden">
                <img
                  src={security.imageUrl || StockIcon}
                  height="64"
                  width="64"
                  className="object-cover"
                  alt={security.secDesc}
                  onError={(event) => {
                    event.currentTarget.src = StockIcon;
                  }}
                />
              </div>
              <h3 className="mt-[20px] text-[#0F0F0F] text-[20px] leading-[28px] font-semibold text-center">
                {props.orderType} {security.secDesc}
              </h3>
            </div>
          </div>

          {/* Scrollable: the form itself */}
          <div className="flex-1 min-h-0 overflow-y-auto px-[24px] pt-[32px] pb-[24px]">
            <form id={BUY_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label name="Select Order type" />
                <FormSelect
                  name="priceType"
                  label="Select order type"
                  options={priceTypeOptions}
                  control={control}
                  error={!!errors.priceType?.message}
                />
              </div>

              <div className="mt-[28px]">
                <Label name="Select Order Term" />
                <FormSelect
                  name="orderTerm"
                  label="Select order term"
                  options={orderTermOptions}
                  control={control}
                  error={!!errors.orderTerm?.message}
                />
              </div>

              {orderTermInfo && (
                <div className="mt-[16px] flex gap-[12px] rounded-[12px] border border-[#B3EBED] bg-[#F0FAFB] p-[16px]">
                  <i className="ri-information-line text-[18px] text-[#00727A] shrink-0"></i>
                  <div>
                    <div className="text-[14px] text-[#00727A] font-semibold leading-[20px]">
                      {orderTermInfo.title}
                    </div>
                    <div className="mt-[4px] text-[13px] text-[#5A5A5A] leading-[19px]">
                      {orderTermInfo.description}
                    </div>
                  </div>
                </div>
              )}

              {selectedPriceType && (
                <div className="mt-[28px]">
                  {selectedPriceType === "limit" ? (
                    <>
                      <Label name="Limit price" />
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={limitPriceInput}
                        onChange={(event) => {
                          // Only digits and a single decimal point — strips
                          // anything else so the field can never land on a
                          // value Number() can't parse (that's what was
                          // producing the stuck "NaN" display).
                          const sanitized = event.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1");
                          setLimitPriceInput(sanitized);
                          setLimitPriceError(undefined);
                        }}
                        error={limitPriceError}
                        placeholder="0.00"
                      />
                    </>
                  ) : (
                    <>
                      <Label name="Market price" />
                      <Input
                        type="text"
                        readOnly
                        value={formatCurrency(security.price, "NGN", "en-NG")}
                        className="cursor-default"
                      />
                    </>
                  )}
                </div>
              )}

              <div className="mt-[28px]">
                <label className="mb-[5px] flex justify-between items-center text-sm font-medium text-[#0F0F0F] tracking-[0.2px] leading-[20px]">
                  <span>Unit</span>
                  {/* <span className="flex items-center gap-2">
                    {isCalculatingPrice && (
                      <CircularProgress size={12} enableTrackSlot value={100} />
                    )}
                    {formatCurrency(estimatedTotal, "NGN", "en-NG")}
                  </span> */}
                </label>
                <Input
                  type="number"
                  {...register("unit", {
                    // `valueAsNumber: true` converts an empty field to the
                    // literal NaN (not undefined), which react-hook-form can
                    // write straight back into the input as the text "NaN" —
                    // this returns undefined instead, same fix as the limit
                    // price field.
                    setValueAs: (value) =>
                      value === "" ? undefined : Number(value),
                  })}
                  error={errors.unit?.message}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-5 gap-[8px] mt-[12px]">
                {staticUnitPrice.map((price, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => updateUnitPrice(price)}
                    className={`cursor-pointer whitespace-nowrap rounded-[99px] px-[6px] py-[10px] text-center text-[13px] font-bold transition-all duration-150 ${
                      getValues("unit") === price
                        ? "scale-[1.04] bg-[#00585E] text-white shadow-[0_4px_14px_rgba(0,88,94,0.3)]"
                        : "border-2 border-[#DCDCDC] bg-(--surface-subtle) text-(--text-content-default) hover:border-(--text-content-default) hover:bg-white"
                    }`}
                  >
                    {price}
                  </button>
                ))}
              </div>

              <div
                className={`mt-[28px] flex items-center justify-between rounded-[12px] px-[16px] py-[14px] ${exceedsBuyingPower ? "bg-[#FDEDED]" : "bg-[#FAFAFA]"}`}
              >
                <div>
                  <div
                    className={`text-[12px] font-medium leading-[16px] tracking-[0.2px] ${exceedsBuyingPower ? "text-[#CC1A30]" : "text-[#5A5A5A]"}`}
                  >
                    {isSell ? "Estimated proceeds" : "Estimated cost"}
                  </div>
                  <div
                    className={`mt-[2px] flex items-center gap-2 text-[16px] font-bold leading-[22px] ${exceedsBuyingPower ? "text-[#CC1A30]" : "text-[#0F0F0F]"}`}
                  >
                    {isCalculatingPrice && (
                      <CircularProgress size={14} enableTrackSlot value={100} />
                    )}
                    {formatCurrency(estimatedTotal, "NGN", "en-NG")}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-[12px] font-medium leading-[16px] tracking-[0.2px] ${exceedsBuyingPower ? "text-[#CC1A30]" : "text-[#5A5A5A]"}`}
                  >
                    {isSell ? "Available units" : "Buying power"}
                  </div>
                  <div
                    className={`mt-[2px] text-[16px] font-bold leading-[22px] ${exceedsBuyingPower ? "text-[#CC1A30]" : "text-[#E77731]"}`}
                  >
                    {isSell
                      ? `${availableUnits.toLocaleString("en-US")} Unit${availableUnits === 1 ? "" : "s"}`
                      : formatCurrency(buyingPower, "NGN", "en-NG")}
                  </div>
                </div>
              </div>

              {exceedsBuyingPower && (
                <p className="mt-[8px] text-[13px] text-[#CC1A30] font-medium">
                  {isSell
                    ? "This order exceeds the units you currently hold. Reduce the unit amount to continue."
                    : "This order costs more than your available buying power. Reduce the unit amount to continue."}
                </p>
              )}
            </form>
          </div>

          {/* Fixed: submit action */}
          <div className="shrink-0 px-[24px] py-[20px] border-t border-[#F0F0F0]">
            <Button
              type="submit"
              form={BUY_FORM_ID}
              variant="primary"
              disabled={exceedsBuyingPower}
              isLoading={false}
              className="rounded-[99px] h-[56px]"
            >
              Review {props.orderType} Order
            </Button>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Fixed: back button + title */}
          <div className="shrink-0 flex justify-between items-center px-[24px] py-[20px] border-b border-[#F0F0F0]">
            <button
              type="button"
              onClick={handleBack}
              className="cursor-pointer"
            >
              <i className="ri-arrow-left-line text-[24px] text-[#0F0F0F]"></i>
            </button>
            <h4 className="text-[16px] text-[#0F0F0F] font-semibold leading-[24px]">
              Review
            </h4>
            <div className="w-[24px]"></div>
          </div>

          {/* Scrollable: order summary */}
          <div className="flex-1 min-h-0 overflow-y-auto px-[24px] py-[24px]">
            <div className="rounded-[24px] bg-[#E9EEF0] px-[24px] py-[40px] text-center">
              <span className="inline-block rounded-[999px] bg-[#C7DBDB] px-[20px] py-[8px] text-[13px] font-bold uppercase tracking-[0.5px] text-[#00585E]">
                {props.orderType === "Buy" ? "Buying Order" : "Selling Order"}
              </span>
              <div className="mt-[24px] text-[36px] font-extrabold text-[#0F0F0F] tracking-[-0.5px]">
                {security.symbol}
              </div>
              <div className="mt-[12px] text-[16px] text-(--text-content-subtle) font-medium">
                {selectedPriceType === "limit" ? "Limit" : "Market"} Order @{" "}
                {formatCurrency(effectivePrice, "NGN", "en-NG")}
              </div>
            </div>

            <div className="mt-[24px]">
              <div className="flex justify-between items-center py-[16px] border-b border-[#F0F0F0]">
                <span className="text-[16px] text-(--text-content-subtle) font-medium">
                  Quantity
                </span>
                <span className="text-[16px] text-[#0F0F0F] font-semibold">
                  {quantity.toLocaleString("en-US")} Unit(s)
                </span>
              </div>

              <div className="flex justify-between items-center py-[16px] border-b border-[#F0F0F0]">
                <span className="text-[16px] text-(--text-content-subtle) font-medium">
                  Order Type
                </span>
                <span className="text-[16px] text-[#0F0F0F] font-semibold">
                  {(selectedPriceType || "").toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center py-[16px] border-b border-[#F0F0F0]">
                <span className="text-[16px] text-(--text-content-subtle) font-medium">
                  Order Term
                </span>
                <span className="text-[16px] text-[#0F0F0F] font-semibold">
                  {TERM_DISPLAY[selectedOrderTerm as string] ??
                    selectedOrderTerm}
                </span>
              </div>

              {(() => {
                const feesRow = (
                  <div
                    key="fees"
                    className="flex justify-between items-center py-[16px] border-b border-[#F0F0F0] gap-4"
                  >
                    <span className="text-[16px] text-(--text-content-subtle) font-medium">
                      Fees (Alert Fees + Stamp Duty + NGX Fees + Brokerage
                      Commission)
                    </span>
                    <span className="text-[16px] text-[#0F0F0F] font-semibold shrink-0">
                      {formatCurrency(
                        priceCalculation?.fees ?? 0,
                        "NGN",
                        "en-NG",
                      )}
                    </span>
                  </div>
                );

                const considerationRow = (
                  <div
                    key="consideration"
                    className="flex justify-between items-center py-[16px] border-b border-[#F0F0F0]"
                  >
                    <span className="flex items-center gap-[6px] text-[16px] text-(--text-content-subtle) font-medium">
                      Consideration (Markup Inclusive)
                      <Tooltip
                        title="The raw value of your order (quantity × price) plus the platform's markup, before other fees like stamp duty and brokerage commission are added."
                        arrow
                        placement="top"
                      >
                        <i className="ri-question-line text-[16px] cursor-pointer"></i>
                      </Tooltip>
                    </span>
                    <span className="text-[16px] text-[#0F0F0F] font-semibold">
                      {formatCurrency(
                        priceCalculation?.consideration ?? 0,
                        "NGN",
                        "en-NG",
                      )}
                    </span>
                  </div>
                );

                // On a sell order, the consideration (what the units are
                // worth) reads more naturally before the fees deducted from
                // it — the reverse of a buy order, where fees are added on
                // top of what you're paying.
                return isSell
                  ? [considerationRow, feesRow]
                  : [feesRow, considerationRow];
              })()}

              <div className="flex justify-between items-center py-[16px]">
                <span className="text-[16px] text-[#0F0F0F] font-bold">
                  {isSell ? "Total Estimated Proceeds" : "Total Estimated Cost"}
                </span>
                <span className="flex items-center gap-2 text-[16px] text-[#0F0F0F] font-bold">
                  {isCalculatingPrice && (
                    <CircularProgress size={14} enableTrackSlot value={100} />
                  )}
                  {formatCurrency(estimatedTotal, "NGN", "en-NG")}
                </span>
              </div>
            </div>

            <div className="mt-[24px] flex gap-[12px] items-start">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
                className="mt-[2px] h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[4px] border border-[#DCDCDC]"
              />
              <span className="text-[13px] text-[#5A5A5A] leading-[19px]">
                By clicking the button below, you agree to the terms of the
                trade and understand that market volatility may affect the
                final execution price of your order.
              </span>
            </div>
          </div>

          {/* Fixed: confirm action */}
          <div className="shrink-0 px-[24px] py-[20px] border-t border-[#F0F0F0]">
            <Button
              type="button"
              variant="primary"
              disabled={!agreedToTerms || !portfolio}
              isLoading={isSubmittingOrder}
              className="rounded-[99px] h-[56px]"
              onClick={handleConfirmOrder}
            >
              Confirm {props.orderType} Order
            </Button>
          </div>
        </div>
      )}
    </Dialog>

    <OrderSuccess
      open={openOrderSuccess}
      setOpen={setOpenOrderSuccess}
      orderType={props.orderType}
      quantity={quantity}
      securitySymbol={security.symbol}
    />
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

export default BuySellSecurity;
