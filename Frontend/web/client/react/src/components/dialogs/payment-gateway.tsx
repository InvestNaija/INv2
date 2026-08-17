import { Dialog, type DialogProps } from "@mui/material";
import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import Button from "../atoms/buttons";
import formatCurrency from "../../hooks/FormatCurrency";
import type { SavedCard, PaymentGatewayConfig } from "../../models/walletModel";
import paystackLogo from "../../assets/icons/paystack.png";

export type PaymentMethod = "wallet" | "payment_partners" | "direct_transfer" | "";

const QUICK_AMOUNTS = [1000, 5000, 10000, 50000, 100000, 500000];

  const getPartnerDisplay = (gateway: string, configs: PaymentGatewayConfig[]) => {
    const partnerConfig = configs.find((c) => c.gateway === gateway);
    
    let defaultLabel = gateway.charAt(0).toUpperCase() + gateway.slice(1);
    let defaultImage: string | null = null;
    
    if (gateway === "paystack") {
      defaultLabel = "Paystack";
      defaultImage = paystackLogo;
    }
    
    return {
      label: partnerConfig?.name || defaultLabel,
      image: partnerConfig?.logo || defaultImage,
      color: "#4A4A4A",
    };
  };

// Badge color per card network — falls back to a neutral gray for anything
// not explicitly known.
const CARD_BRAND_COLORS: Record<string, string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  verve: "#00A651",
};

// Generic funding entry point — any "fund account" flow in the app opens
// this same dialog rather than building its own amount+method UI. The
// caller only owns what happens once the customer confirms (onContinue),
// so it stays reusable across Trade, Investments, Save, etc.
interface PaymentGatewayProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  // Preset, non-editable amount (e.g. paying a fixed plan/bill). Omit to
  // let the customer type/pick their own amount instead.
  fixedAmount?: number;
  walletBalance?: number;
  // Previously-saved gateway cards (e.g. from Paystack) — shown as a quick
  // "pay with a saved card" option once Payment partners is expanded.
  savedCards?: SavedCard[];
  // Gateway keys actually configured for this funding flow (e.g.
  // ["paystack"]), from GET /3rd-party-services/gateway — only these show
  // up as "pay with a new card via ..." options, rather than assuming
  // every known partner is always available.
  availablePartners?: string[];
  configs?: PaymentGatewayConfig[];
  isSubmitting?: boolean;
  currency?: string;
  isLoadingConfigs?: boolean;
  onRefresh?: () => void;
  onContinue: (
    amount: number,
    method: PaymentMethod,
    partner?: string,
    cardId?: string,
    receiptFile?: File,
    saveCard?: boolean
  ) => void;
  isAddCardMode?: boolean;
  // Hides the "Wallet" payment method — for flows funding the wallet
  // itself, where paying from the wallet to fund the wallet is circular.
  hideWalletOption?: boolean;
}

const PaymentGateway = ({
  open,
  setOpen,
  title = "Make payment",
  fixedAmount,
  walletBalance,
  savedCards = [],
  availablePartners = [],
  configs = [],
  isSubmitting = false,
  currency = "NGN",
  isLoadingConfigs,
  onRefresh,
  onContinue,
  isAddCardMode = false,
  hideWalletOption = false,
}: PaymentGatewayProps) => {
  const [amountInput, setAmountInput] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(isAddCardMode ? "payment_partners" : null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saveCard, setSaveCard] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setAmountInput("");
    setMethod(null);
    setSelectedPartner(null);
    setSelectedCardId(null);
    setReceiptFile(null);
  };

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  // Only digits and a single decimal point — keeps the amount from ever
  // landing on a value that can't be parsed back to a number. Commas are
  // stripped first since the displayed value is comma-formatted (see
  // formatAmountDisplay) and get typed back in as the user keeps editing.
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value
      .replace(/,/g, "")
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setAmountInput(sanitized);
  };

  // Formats the integer part with thousands separators while preserving
  // whatever the user has typed after the decimal point verbatim (including
  // a bare trailing "." mid-type) — never round-trips through Number() on
  // the decimal side, which is what caused the earlier "stuck NaN" bug.
  const formatAmountDisplay = (raw: string) => {
    if (raw === "") return "";
    const [integerPart, decimalPart] = raw.split(".");
    const formattedInteger = integerPart
      ? Number(integerPart).toLocaleString("en-US")
      : "";
    return raw.includes(".")
      ? `${formattedInteger}.${decimalPart ?? ""}`
      : formattedInteger;
  };

  const amount = fixedAmount ?? (Number(amountInput) || 0);
  const isInsufficientBalance = walletBalance !== undefined && amount > walletBalance;

  const isContinueDisabled =
    !amount ||
    amount <= 0 ||
    isSubmitting ||
    !method ||
    (method === "wallet" && (isInsufficientBalance || !walletBalance)) ||
    (method === "payment_partners" && !selectedPartner && !selectedCardId) ||
    (method === "direct_transfer" && !receiptFile);

  const handleContinue = () => {
    if (isContinueDisabled || !method) return;

    if (method === "wallet" && walletBalance !== undefined && amount > walletBalance) {
      toast.error("Insufficient wallet balance for this transaction.");
      return;
    }

    onContinue(
      amount,
      method,
      selectedPartner ?? undefined,
      selectedCardId ?? undefined,
      receiptFile ?? undefined,
      saveCard
    );
  };

  // Picking a saved card auto-selects its underlying gateway (so
  // canContinue's `selectedPartner` check still passes); picking a partner
  // pill directly means "add a new card via this gateway", so it clears any
  // previously-chosen saved card.
  const handleSelectCard = (card: SavedCard) => {
    setSelectedCardId(card.saveCard || card.id);
    setSelectedPartner(card.gateway);
  };

  const handleSelectPartner = (partnerValue: string) => {
    setSelectedCardId(null);
    setSelectedPartner(partnerValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setReceiptFile(e.dataTransfer.files[0]);
    }
  };

  const bankConfig = configs.find((c) => c.gateway === "bank" || c.type === "bank");
  const actualPartners = availablePartners.filter((p) => {
    if (p === "bank") return false;
    const config = configs.find((c) => c.gateway === p);
    return config?.type === "card";
  });

  const isPartnersExpanded = method === "payment_partners";
  const isDirectTransferExpanded = method === "direct_transfer";

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      slotProps={{
        transition: {
          onEnter: resetForm,
          // MUI's Dialog manages focus itself once its enter transition
          // finishes, which can steal focus back from the input's native
          // `autoFocus` — focusing imperatively here, after that transition
          // settles, is what actually makes the cursor land in the field.
          onEntered: () => amountInputRef.current?.focus(),
        },
        backdrop: {
          sx: { backdropFilter: "blur(4px)", backgroundColor: "rgba(15, 15, 15, 0.45)" },
        },
        paper: {
          sx: {
            backgroundColor: "var(--surface-default)",
            borderRadius: { xs: "20px", sm: "24px" },
            width: { xs: "100%", sm: "580px" },
            maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
            margin: { xs: "12px", sm: "32px" },
            maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
            overflowY: "auto",
            padding: { xs: "20px 16px", sm: "28px 32px 32px" },
          },
        },
      }}
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full bg-(--surface-subtle) text-(--text-content-default) hover:bg-(--border-default)"
        >
          <i className="ri-close-line text-[20px]"></i>
        </button>
      </div>

      <h2 className="text-center text-[20px] sm:text-[24px] font-bold text-(--text-content-default)">
        {title}
      </h2>

      <div className="mt-[12px] flex justify-center px-[4px]">
        {fixedAmount !== undefined ? (
          <span className="flex items-baseline gap-[6px] max-w-full">
            <span className="shrink-0 text-[16px] sm:text-[20px] font-bold text-(--text-content-muted)">
              {currency === "USD" ? "$" : "₦"}
            </span>
            <span className="max-w-full break-all text-[32px] sm:text-[40px] font-extrabold leading-none text-(--text-content-default) tracking-[-0.5px]">
              {fixedAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
        ) : (
          <span className="flex items-baseline gap-[6px] max-w-full">
            <span className="shrink-0 text-[16px] sm:text-[20px] font-bold leading-none text-(--text-content-muted)">
              {currency === "USD" ? "$" : "₦"}
            </span>
            <input
              ref={amountInputRef}
              type="text"
              inputMode="decimal"
              value={formatAmountDisplay(amountInput)}
              onChange={handleAmountChange}
              placeholder="0.00"
              autoFocus
              autoComplete="off"
              name="payment-gateway-amount"
              size={Math.max(formatAmountDisplay(amountInput).length + 1, 4)}
              className="min-w-0 max-w-full bg-transparent border-none outline-none text-left text-[32px] sm:text-[40px] font-extrabold leading-none tracking-[-0.5px] text-(--text-content-default) placeholder:text-(--text-content-muted) caret-[#00585E]"
            />
          </span>
        )}
      </div>

      {fixedAmount === undefined && (
        <div className="mt-[16px] flex flex-wrap justify-center gap-[6px] sm:gap-[8px]">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <button
              type="button"
              key={quickAmount}
              onClick={() => setAmountInput(String(quickAmount))}
              className={`cursor-pointer whitespace-nowrap rounded-[999px] px-[12px] sm:px-[16px] py-[7px] sm:py-[9px] text-[12px] sm:text-[13px] font-bold transition-all duration-150 active:scale-[0.96] ${
                amount === quickAmount
                  ? "scale-[1.04] bg-[#00585E] text-white shadow-[0_4px_14px_rgba(0,88,94,0.3)]"
                  : "border-2 border-[#DCDCDC] bg-(--surface-subtle) text-(--text-content-default) hover:border-(--text-content-default) hover:bg-white"
              }`}
            >
              {formatCurrency(quickAmount, "NGN", "en-NG")}
            </button>
          ))}
        </div>
      )}

      <div className="mt-[24px] sm:mt-[32px]">
        <div className="relative flex items-center justify-center px-[36px] sm:px-0">
          <h3 className="text-center text-[17px] sm:text-[22px] font-medium text-(--text-content-default)">
            How would you like to pay?
          </h3>
          {onRefresh && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRefresh();
              }}
              disabled={isLoadingConfigs}
              className="absolute right-0 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F0FAFB] text-(--text-content-brand) transition-all hover:bg-[#E0F5F6] disabled:opacity-50"
              title="Refresh payment options"
            >
              <i className={`ri-refresh-line text-[18px] ${isLoadingConfigs ? 'animate-spin' : ''}`}></i>
            </button>
          )}
        </div>

        <div className="mt-[12px] flex flex-col gap-[10px]">
          {isLoadingConfigs && configs.length === 0 ? (
            <div className="flex h-[150px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--text-content-brand) border-t-transparent"></div>
            </div>
          ) : (
            <>
              {currency !== "USD" && !isAddCardMode && !hideWalletOption && (
                <>
              {/* Wallet — shrinks down to a compact row once Payment partners
                  is expanded, so the expanded option keeps the attention. */}
              <button
            type="button"
            onClick={() => setMethod(method === "wallet" ? "" : "wallet")}
            className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[16px] border-2 text-left transition-all duration-200 ${
              method === "wallet"
                ? isInsufficientBalance
                  ? "border-red-500 bg-[#FFF5F5] px-[18px] py-[16px]"
                  : "border-(--text-content-brand) bg-[#F0FAFB] px-[18px] py-[16px]"
                : method !== ""
                  ? "border-[#DCDCDC] px-[14px] py-[10px] hover:border-(--text-content-default)"
                  : "border-[#DCDCDC] px-[18px] py-[16px] hover:border-(--text-content-default)"
            }`}
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-[10px] transition-all duration-200 ${
                method === "wallet"
                  ? "h-[40px] w-[40px] text-[18px] bg-[#00585E] text-white"
                  : "h-[32px] w-[32px] text-[15px] bg-(--surface-subtle) text-(--text-content-default)"
              }`}
            >
              <i className="ri-wallet-3-fill"></i>
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-(--text-content-default)">
                Wallet
              </span>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  !method || method === "wallet" ? "max-h-[30px] opacity-100 mt-[2px]" : "max-h-0 opacity-0 mt-0"
                }`}
              >
                {walletBalance !== undefined ? (
                  <span className="flex items-baseline gap-[6px]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-(--text-content-muted)">
                      Balance
                    </span>
                    <span
                      className={`text-[15px] font-extrabold ${
                        method === "wallet" && isInsufficientBalance
                          ? "text-red-500"
                          : "text-(--text-content-brand)"
                      }`}
                    >
                      {formatCurrency(walletBalance, "NGN", "en-NG")}
                    </span>
                  </span>
                ) : (
                  <span className="block text-[13px] text-(--text-content-muted) font-medium">
                    Pay instantly from your wallet balance
                  </span>
                )}
              </div>
            </span>
            {method === "wallet" && (
              <span
                className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border-2 ${
                  isInsufficientBalance
                    ? "border-red-500 bg-red-500"
                    : "border-(--text-content-brand) bg-(--text-content-brand)"
                }`}
              >
                <i className="ri-check-line text-[13px] text-white"></i>
              </span>
            )}
          </button>

            </>
          )}

          {/* Payment partners — expands into a Paystack/Flutterwave picker
              once selected, becoming the visually dominant option. */}
          {(actualPartners.length > 0 || isLoadingConfigs) && (
            <div
            className={`rounded-[16px] border-2 text-left transition-all duration-200 ${
              isPartnersExpanded
                ? "border-(--text-content-brand) bg-[#F0FAFB] shadow-[0_6px_20px_rgba(0,88,94,0.12)] px-[18px] py-[16px]"
                : method !== ""
                  ? "border-[#DCDCDC] px-[14px] py-[10px] hover:border-(--text-content-default)"
                  : "border-[#DCDCDC] px-[18px] py-[16px] hover:border-(--text-content-default)"
            }`}
          >
            <button
              type="button"
              onClick={() => setMethod(method === "payment_partners" ? "" : "payment_partners")}
              className="flex w-full cursor-pointer items-center gap-[12px] text-left"
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-[10px] transition-all duration-200 ${
                  isPartnersExpanded
                    ? "h-[40px] w-[40px] text-[18px] bg-[#00585E] text-white"
                    : "h-[32px] w-[32px] text-[15px] bg-(--surface-subtle) text-(--text-content-default)"
                }`}
              >
                <i className="ri-bank-card-2-fill"></i>
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-bold text-(--text-content-default)">
                  Payment partners
                </span>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    !method || method === "payment_partners" ? "max-h-[30px] opacity-100 mt-[2px]" : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  <span className="block text-[13px] text-(--text-content-subtle) font-medium">
                    Pay by card or bank transfer
                  </span>
                </div>
              </span>
              <span
                className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                  isPartnersExpanded
                    ? "rotate-180 border-[#00585E] bg-[#00585E] text-white"
                    : "border-[#DCDCDC] bg-white text-(--text-content-default)"
                }`}
              >
                <i className="ri-arrow-down-s-line text-[20px] font-bold"></i>
              </span>
            </button>

            {isPartnersExpanded && (
              <div className="mt-[16px] border-t border-[#B3EBED] pt-[16px]">
                {isLoadingConfigs ? (
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--text-content-brand) border-t-transparent"></div>
                  </div>
                ) : (
                  <>
                    {currency !== "USD" && savedCards.length > 0 && (
                      <div className="mb-[16px]">
                        <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.5px] text-(--text-content-muted)">
                          <span>Saved cards</span>
                          <span className="normal-case tracking-normal text-(--text-content-subtle)">
                            {savedCards.length}
                          </span>
                        </span>
                        <div className="mt-[8px] flex max-h-[210px] flex-col gap-[8px] overflow-y-auto pr-[2px]">
                          {savedCards.map((card) => {
                            const actualCardId = card.saveCard || card.id;
                            const isCardSelected = selectedCardId === actualCardId;
                            const brandColor =
                              CARD_BRAND_COLORS[
                                card.card_details.brand.toLowerCase()
                              ] ?? "#5A5A5A";
                            return (
                              <button
                                key={actualCardId}
                                type="button"
                                onClick={() => handleSelectCard(card)}
                                className={`flex cursor-pointer items-center gap-[12px] rounded-[12px] border-2 bg-white px-[14px] py-[13px] text-left transition-colors ${
                                  isCardSelected
                                    ? "border-(--text-content-brand) shadow-[0_2px_10px_rgba(0,88,94,0.15)]"
                                    : "border-[#DCDCDC] hover:border-(--text-content-default)"
                                }`}
                              >
                                <span
                                  className="flex h-[36px] w-[48px] shrink-0 items-center justify-center rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]"
                                >
                                  {card.card_details.brand.toLowerCase().includes('mastercard') ? (
                                    <i className="ri-mastercard-fill text-[24px] text-[#EB001B]"></i>
                                  ) : card.card_details.brand.toLowerCase().includes('visa') ? (
                                    <i className="ri-visa-line text-[28px] text-[#1A1F71]"></i>
                                  ) : (
                                    <i className="ri-bank-card-fill text-[20px] text-[#64748B]"></i>
                                  )}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[12px] font-bold text-(--text-content-default) truncate uppercase">
                                    {card.card_details.account_name || `${card.card_details.brand} Card`}
                                  </span>
                                  <div className="flex items-center gap-2 mt-[2px]">
                                    <span className="block text-[13px] font-bold text-(--text-content-default)">
                                      ••• {card.card_details.last_4digits}
                                    </span>
                                    <span className="block text-[11px] text-(--text-content-muted) font-medium">
                                      Exp {card.card_details.expiry}
                                    </span>
                                  </div>
                                </span>
                                {isCardSelected && (
                                  <i className="ri-checkbox-circle-fill ml-auto shrink-0 text-[16px] text-(--text-content-brand)"></i>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {currency !== "USD" && savedCards.length > 0 && actualPartners.length > 0 && (
                      <span className="mb-[8px] block text-[11px] font-bold uppercase tracking-[0.5px] text-(--text-content-muted)">
                        Or pay with
                      </span>
                    )}

                    {actualPartners.length > 0 ? (
                      <div className="grid grid-cols-2 gap-[10px]">
                        {actualPartners.map((gateway) => {
                          const partner = getPartnerDisplay(gateway, configs);
                          const isPartnerSelected =
                            selectedPartner === gateway && !selectedCardId;
                          return (
                            <button
                              key={gateway}
                              type="button"
                              onClick={() => handleSelectPartner(gateway)}
                              className={`flex cursor-pointer items-center gap-[10px] rounded-[12px] border-2 bg-white px-[14px] py-[13px] transition-colors ${
                                isPartnerSelected
                                  ? "border-(--text-content-brand) shadow-[0_2px_10px_rgba(0,88,94,0.15)]"
                                  : "border-[#DCDCDC] hover:border-(--text-content-default)"
                              }`}
                            >
                              {partner.image ? (
                                <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[9px] border border-[#DCDCDC] bg-white p-[4px]">
                                  <img
                                    src={partner.image}
                                    alt={partner.label}
                                    className="h-full w-full object-contain"
                                  />
                                </span>
                              ) : (
                                <span
                                  className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[9px] text-[14px] font-extrabold text-white"
                                  style={{ backgroundColor: partner.color }}
                                >
                                  {partner.label.charAt(0)}
                                </span>
                              )}
                              <span className="truncate text-[14px] font-bold text-(--text-content-default)">
                                {partner.label}
                              </span>
                              {isPartnerSelected && (
                                <i className="ri-checkbox-circle-fill ml-auto shrink-0 text-[16px] text-(--text-content-brand)"></i>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      (currency === "USD" || savedCards.length === 0) && (
                        <p className="text-[13px] font-medium text-(--text-content-muted)">
                          No payment partners are available right now.
                        </p>
                      )
                    )}

                    {actualPartners.length > 0 && selectedPartner && !selectedCardId && (
                      <div className="mt-[20px] mb-[4px] pt-[16px] border-t border-[#E5E5E5]">
                        <label className={`flex items-start gap-3 ${isAddCardMode ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <div className="relative flex items-center justify-center mt-[2px]">
                            <input 
                              type="checkbox" 
                              checked={saveCard} 
                              onChange={(e) => !isAddCardMode && setSaveCard(e.target.checked)}
                              disabled={isAddCardMode}
                              className={`peer appearance-none w-[18px] h-[18px] border-2 rounded-[4px] transition-colors ${saveCard ? 'border-[#00585E] bg-[#00585E]' : 'border-[#DCDCDC] bg-white'} ${isAddCardMode ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
                            />
                            {saveCard && <i className="ri-check-line absolute text-white text-[14px] pointer-events-none"></i>}
                          </div>
                          <span className={`text-[14px] font-medium text-[#5A5A5A] leading-[20px] select-none ${isAddCardMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            Save my card for subsequent payment
                          </span>
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          )}

          {!!bankConfig && !isAddCardMode && (
            <div
              className={`rounded-[16px] border-2 text-left transition-all duration-200 ${
                isDirectTransferExpanded
                  ? "border-(--text-content-brand) bg-[#F0FAFB] shadow-[0_6px_20px_rgba(0,88,94,0.12)] px-[18px] py-[16px]"
                  : method !== ""
                    ? "border-[#DCDCDC] px-[14px] py-[10px] hover:border-(--text-content-default)"
                    : "border-[#DCDCDC] px-[18px] py-[16px] hover:border-(--text-content-default)"
              }`}
            >
              <button
                type="button"
                onClick={() => setMethod(method === "direct_transfer" ? "" : "direct_transfer")}
                className="flex w-full cursor-pointer items-center gap-[12px] text-left"
              >
                <span
                  className={`flex shrink-0 items-center justify-center rounded-[10px] transition-all duration-200 ${
                    isDirectTransferExpanded
                      ? "h-[40px] w-[40px] text-[18px] bg-[#00585E] text-white"
                      : "h-[32px] w-[32px] text-[15px] bg-(--surface-subtle) text-(--text-content-default)"
                  }`}
                >
                  <i className="ri-bank-line"></i>
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold text-(--text-content-default)">
                    Direct transfer
                  </span>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      !method || method === "direct_transfer" ? "max-h-[30px] opacity-100 mt-[2px]" : "max-h-0 opacity-0 mt-0"
                    }`}
                  >
                    <span className="block text-[13px] text-(--text-content-subtle) font-medium">
                      Upload your payment receipt
                    </span>
                  </div>
                </span>
                <span
                  className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isDirectTransferExpanded
                      ? "rotate-180 border-[#00585E] bg-[#00585E] text-white"
                      : "border-[#DCDCDC] bg-white text-(--text-content-default)"
                  }`}
                >
                  <i className="ri-arrow-down-s-line text-[20px] font-bold"></i>
                </span>
              </button>

              {isDirectTransferExpanded && (
                <div className="mt-[16px] border-t border-[#B3EBED] pt-[16px]">
                  <div 
                    className="text-[14px] text-[#5A5A5A] mb-[24px] font-medium leading-[22px] [&_h3]:font-bold [&_h3]:text-[#0F0F0F] [&_h3]:mb-[12px] [&_h3]:text-[16px] [&_b]:text-[#0F0F0F]"
                    dangerouslySetInnerHTML={{ __html: bankConfig.details || "" }} 
                  />

                  <div 
                    className={`border-2 border-dashed rounded-[16px] p-[24px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      receiptFile ? 'border-[#00585E] bg-[#F3FAFA]' : 'border-[#DCDCDC] hover:border-[#00585E] bg-white'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,.pdf" 
                      onChange={handleFileChange} 
                    />
                    <div className="w-[40px] h-[40px] rounded-full bg-[#EBF4F5] flex items-center justify-center mb-[12px]">
                      <i className={`text-[20px] text-[#00585E] ${receiptFile ? 'ri-file-check-line' : 'ri-upload-cloud-2-line'}`}></i>
                    </div>
                    
                    {receiptFile ? (
                      <>
                        <p className="text-[14px] font-bold text-[#0F0F0F] mb-[4px]">{receiptFile.name}</p>
                        <p className="text-[12px] text-[#5A5A5A]">Click or drag to replace receipt</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[14px] font-bold text-[#0F0F0F] mb-[4px]">Upload Payment Receipt</p>
                        <p className="text-[12px] text-[#5A5A5A]">JPEG, PNG, or PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>

      <div className="mt-[24px] sm:mt-[32px] flex justify-end gap-[12px]">
        <Button
          type="button"
          variant="empty"
          disabled={isSubmitting}
          isLoading={false}
          className="!w-auto rounded-[12px] h-[48px] px-[24px] border border-(--border-default) transition-transform active:scale-[0.98]"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={isContinueDisabled}
          isLoading={isSubmitting}
          className="!w-auto rounded-[12px] h-[48px] px-[28px] transition-transform active:scale-[0.98]"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </Dialog>
  );
};

export default PaymentGateway;
