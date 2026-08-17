import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import type { Portfolio } from "../../models/portfolioModel";
import PortfolioSelect from "../molecules/portfolio-select";
import formatCurrency from "../../hooks/FormatCurrency";
import { getPurchasingPower, getCurrencyBalances } from "../../hooks/portfolioHelpers";
import Button from "../atoms/buttons";
import { useUser } from "../../contexts/userContext";
import EmptyStateIcon from "../atoms/empty-state-icon";
import WithdrawToWallet from "../dialogs/withdraw-to-wallet";
import OtpVerification from "../dialogs/otp-verification";
import PaymentGateway, { type PaymentMethod } from "../dialogs/payment-gateway";
import PaymentSuccess from "../dialogs/payment-success";
import AdditionalKyc from "../dialogs/additional-kyc";
import { useWalletFeatures } from "../../contexts/walletContext";
import type { SavedCard, PaymentGatewayConfig } from "../../models/walletModel";
import { useTrade } from "../../contexts/tradeContext";

// Same OTP email used by the wallet's own withdrawal flow — this just
// confirms a different kind of withdrawal (portfolio cash account -> wallet
// instead of wallet -> bank).
const WITHDRAW_OTP_SUBJECT = "Verify Activity";
const WITHDRAW_OTP_MESSAGE = "<p>Please verify your request to withdraw</p>";
const TRADE_DASHBOARD_REDIRECT_URL =
  "https://app.investnaija.com/app/invest/trade/dashboard";

// Fixed "tradein" funding-module identifiers — confirmed from a real
// reference implementation, not portfolio- or user-specific. Used both to
// look up which payment partner(s) are configured (GET
// /3rd-party-services/gateway) and inside the fund payload itself.
const TRADEIN_MODULE = "tradein";
const TRADEIN_ASSET_ID = "c478f325-ed8c-4062-856d-bd6f4a303709";
const FUND_TRADE_ACCOUNT_POST_URL = `${import.meta.env.VITE_BASE_URL}/trades/fund-wallet`;

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? (error.response?.data?.error?.message ??
        error.response?.data?.message ??
        error.message)
    : fallback;

interface PortfolioBalanceCardProps {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  onSelectPortfolio: (portfolio: Portfolio) => void;
  isLoading?: boolean;
  // True when the portfolios request itself failed (as opposed to
  // succeeding with an empty list) — shows a retry state instead of the
  // plain "nothing here" empty state.
  isError?: boolean;
  // Set when the portfolios request failed specifically because an
  // onboarding step (BVN, etc.) isn't done — the backend's own message
  // (e.g. "Verify your bvn to proceed"), shown with a link to Settings
  // instead of the generic "something went wrong" retry state.
  verificationMessage?: string | null;
  onRetry?: () => void;
  // True while re-fetching live balance figures for a just-selected
  // portfolio (GET /trades/portfolios/{id}) — shows a small inline spinner
  // next to "Total Balance" rather than the full-card loading state.
  isRefreshingBalance?: boolean;
  // Where "See breakdown" links to — differs between the Trade and
  // Investments dashboards.
  breakdownHref: string;
  // Trade has margin/cash concepts (purchasing power, fund/withdraw) that
  // don't apply to a mutual-funds/assets portfolio — set true on the
  // Investments dashboard to hide the stats grid and action buttons.
  compact?: boolean;
}

const StatCell = ({
  label,
  value,
  description,
  showBalance,
}: {
  label: string;
  value: string;
  description: string;
  showBalance: boolean;
}) => (
  <div>
    <div className="flex items-center gap-[4px] text-[13px] text-(--text-content-subtle) font-semibold">
      <span>{label}</span>
      <Tooltip title={description} arrow placement="top">
        <i className="ri-information-line text-[13px] cursor-pointer"></i>
      </Tooltip>
    </div>
    <div className="mt-[4px] text-[16px] text-(--text-content-default) font-bold">
      {showBalance ? value : "₦••••"}
    </div>
  </div>
);

// Balance card shared by the Trade and Investments dashboards — same
// bordered card used everywhere else on these pages, now showing the
// portfolio switcher plus real balance/purchasing-power/equity figures
// instead of the previous static "₦0.00" placeholder.
const PortfolioBalanceCard = ({
  portfolios,
  selectedPortfolio,
  onSelectPortfolio,
  isLoading = false,
  isError = false,
  verificationMessage = null,
  onRetry,
  isRefreshingBalance = false,
  breakdownHref,
  compact = false,
}: PortfolioBalanceCardProps) => {
  const { currentUser, updateShowBalance } = useUser();
  const { withdrawCashAccount, fundAccount } = useTrade();
  const { fetchPaymentGatewayOptions, fetchGatewaySavedCards, balance: walletContextBalance, sendWithdrawOtp } = useWalletFeatures();
  const showBalance = currentUser?.show_balance ?? true;
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);

  const [openFundDialog, setOpenFundDialog] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [openFundSuccess, setOpenFundSuccess] = useState(false);
  const [fundedAmount, setFundedAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | undefined>(
    undefined,
  );
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [availablePartners, setAvailablePartners] = useState<string[]>([]);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentGatewayConfig[]>([]);

  // Same lazy-on-open pattern, for which payment partner(s) are actually
  // configured for the "tradein" funding module.
  useEffect(() => {
    if (!openFundDialog || availablePartners.length > 0) return;

    fetchPaymentGatewayOptions(TRADEIN_MODULE, TRADEIN_ASSET_ID)
      .then((response) => {
        setPaymentConfigs(response.data);
        setAvailablePartners(response.data.map((config) => config.gateway));
      })
      .catch(() => {
        // Silent — the dialog just shows no partner options (saved cards,
        // if any, still work) when this fails.
      });
  }, [openFundDialog, availablePartners.length]);

  // Fetched lazily the first time the fund dialog is opened, so the
  // "Wallet" option can show the customer's actual balance rather than a
  // generic description.
  useEffect(() => {
    if (!openFundDialog || walletBalance !== undefined) return;
    setWalletBalance(walletContextBalance);
  }, [openFundDialog, walletContextBalance, walletBalance]);

  // Same lazy-on-open pattern, for the "pay with a saved card" list under
  // Payment partners.
  useEffect(() => {
    if (!openFundDialog || !currentUser?.id || savedCards.length > 0) return;

    fetchGatewaySavedCards(currentUser.id)
      .then((response) => setSavedCards(response.data))
      .catch(() => {
        // Silent — the dialog just shows the Paystack/Flutterwave partner
        // pickers without a saved-cards section when this fails.
      });
  }, [openFundDialog, currentUser?.id, savedCards.length]);

  // Wallet and Payment partners (card, saved or new) both post to the same
  // /trades/fund-wallet endpoint — only paymentMethod/gateway differ
  // ("wallet"/"wallet" vs "online"/<partner>).
  const handleFundContinue = async (
    amount: number,
    method: PaymentMethod,
    partner?: string,
    cardId?: string,
  ) => {
    if (!selectedPortfolio) return;

    const gateway = method === "wallet" ? "wallet" : partner;
    if (!gateway) return;

    // A fresh card/bank payment (no saved card picked) needs the
    // channel/channels/gateway_id fields; a saved-card charge needs
    // payment_type/saved_card_id instead; wallet needs neither.
    const isNewCardPayment = method === "payment_partners" && !cardId;

    setIsFunding(true);
    try {
      // Current page's URL with any query string stripped — matches the
      // reference implementation's `protocol + host + path` (no query).
      const redirectUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

      const response = await fundAccount(
        {
          amount,
          paymentMethod: method === "wallet" ? "wallet" : "online",
          gateway,
          id: TRADEIN_ASSET_ID,
          currency: "NGN",
          source: "tradein",
          type: "credit",
          description: "Fund trading account (WEB)",
          redirect_url: redirectUrl,
          post_url: FUND_TRADE_ACCOUNT_POST_URL,
          callback_params: {
            module: "tradein",
            asset_id: TRADEIN_ASSET_ID,
            ...(isNewCardPayment ? { gateway_id: TRADEIN_ASSET_ID } : {}),
            saveCard: false,
            brokerageInfo: {},
          },
          portfolioId: selectedPortfolio.id,
          cashAccountId: selectedPortfolio.cashAccountId,
          ...(cardId
            ? { payment_type: "saved_card" as const, saved_card_id: cardId }
            : {}),
          ...(isNewCardPayment
            ? {
                gateway_id: TRADEIN_ASSET_ID,
                channel: gateway,
                channels: ["card", "bank_transfer"],
              }
            : {}),
        },
        selectedPortfolio.signature,
      );

      const authorizationUrl = response.data?.authorization_url;
      if (authorizationUrl) {
        // Hosted checkout (a new card) — hand off to the gateway's page to
        // finish the payment; nothing left to do on this side until the
        // redirect_url brings the customer back.
        window.location.href = authorizationUrl;
        return;
      }

      toast.success("Funding request submitted");
      setFundedAmount(amount);
      setOpenFundDialog(false);
      setOpenFundSuccess(true);
      // Deferred until the success modal is dismissed (not fired here) —
      // onRetry flips this component's own `isLoading` prop, which
      // early-returns a bare spinner and would unmount the modal we just
      // opened before the customer ever sees it.
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fund your account"));
    } finally {
      setIsFunding(false);
    }
  };

  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [pendingWithdrawalAmount, setPendingWithdrawalAmount] = useState(0);

  // Step 1: amount entered in WithdrawToWallet — send the OTP, then swap to
  // the OTP dialog to confirm before actually moving any money.
  const handleWithdrawProceed = async (amount: number) => {
    if (!currentUser?.email) return;

    setIsSendingOtp(true);
    try {
      await sendWithdrawOtp({
        email: currentUser.email,
        subject: WITHDRAW_OTP_SUBJECT,
        message: WITHDRAW_OTP_MESSAGE,
      });
      setPendingWithdrawalAmount(amount);
      setOpenWithdrawDialog(false);
      setOpenOtpDialog(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send verification code"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!currentUser?.email) return;

    setIsResendingOtp(true);
    try {
      await sendWithdrawOtp({
        email: currentUser.email,
        subject: WITHDRAW_OTP_SUBJECT,
        message: WITHDRAW_OTP_MESSAGE,
      });
      toast.success("A new code has been sent to your email");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to resend verification code"),
      );
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Step 2: OTP confirmed — submit the actual withdrawal using the amount
  // captured in step 1 plus the code just entered.
  const handleOtpSubmit = async (otp: string) => {
    if (!currentUser?.email || !selectedPortfolio) return;

    setIsWithdrawing(true);
    try {
      await withdrawCashAccount({
        email: currentUser.email,
        resendOtp: false,
        amount: pendingWithdrawalAmount,
        portfolioId: selectedPortfolio.portfolioId,
        cashAccountId: selectedPortfolio.cashAccountId,
        redirect_url: TRADE_DASHBOARD_REDIRECT_URL,
        signature: selectedPortfolio.signature,
        token: otp,
      });
      toast.success("Withdrawal successful");
      setOpenOtpDialog(false);
      setPendingWithdrawalAmount(0);
      onRetry?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Withdrawal failed. Please try again."));
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full border border-[#F4F4F4] rounded-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)] px-[20px] py-[32px] flex flex-col animate-pulse">
        <div className="h-8 bg-[#F0F0F0] rounded w-1/4 mx-auto mb-8"></div>
        <div className="h-14 bg-[#F0F0F0] rounded-[12px] w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-[#F0F0F0] rounded w-1/3 mx-auto mb-12"></div>
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="h-16 bg-[#F0F0F0] rounded-[8px] w-full"></div>
          <div className="h-16 bg-[#F0F0F0] rounded-[8px] w-full"></div>
        </div>
      </div>
    );
  }

  if (verificationMessage) {
    return (
      <>
        <div className="h-full border border-[#F4F4F4] rounded-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)] px-[20px] py-[48px] flex flex-col justify-center">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#FFF3E0]">
              <i className="ri-shield-keyhole-line text-[28px] text-[#E77731]"></i>
            </span>
            <p className="mt-[16px] text-[15px] text-(--text-content-default) font-semibold">
              Complete your KYC to proceed
            </p>
            <p className="mt-[4px] text-[13px] text-(--text-content-muted) max-w-[280px]">
              Complete this step to view and use your portfolio.
            </p>
            <Button
              variant="empty"
              disabled={false}
              isLoading={false}
              className="mt-[20px] rounded-[99px] h-[44px] px-[24px] border border-[#DCDCDC]"
              onClick={() => setOpenAdditionalKyc(true)}
            >
              Complete verification
            </Button>
          </div>
        </div>
        <AdditionalKyc
          openAdditionalKycDialog={openAdditionalKyc}
          setAdditionalKycDialog={(open) => {
            setOpenAdditionalKyc(open);
            // Recheck once the dialog closes — either they finished (so
            // the portfolios call should now succeed) or dismissed it, in
            // which case this just re-shows the same prompt.
            if (!open) onRetry?.();
          }}
        />
      </>
    );
  }

  if (isError) {
    return (
      <div className="h-full border border-[#F4F4F4] rounded-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)] px-[20px] py-[48px] flex flex-col justify-center">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#FDEDED]">
            <i className="ri-error-warning-line text-[28px] text-[#CC1A30]"></i>
          </span>
          <p className="mt-[16px] text-[15px] text-(--text-content-default) font-semibold">
            Unable to load your portfolio
          </p>
          <p className="mt-[4px] text-[13px] text-(--text-content-muted) max-w-[280px]">
            Something went wrong while fetching your data. Check your
            connection and try again.
          </p>
          {onRetry && (
            <Button
              variant="empty"
              disabled={false}
              isLoading={false}
              className="mt-[20px] rounded-[99px] h-[44px] px-[24px] border border-[#DCDCDC]"
              onClick={onRetry}
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!selectedPortfolio) {
    return (
      <div className="h-full border border-[#F4F4F4] rounded-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)] px-[20px] py-[48px] flex flex-col justify-center">
        <div className="flex flex-col items-center text-center">
          <EmptyStateIcon size={56} />
          <p className="mt-[16px] text-[15px] text-(--text-content-default) font-semibold">
            No portfolio yet
          </p>
          <p className="mt-[4px] text-[13px] text-(--text-content-muted) max-w-[280px]">
            You don't have a portfolio here yet. Fund your account to get
            started.
          </p>
        </div>
      </div>
    );
  }

  const purchasingPower = getPurchasingPower(selectedPortfolio);
  const netEquityValue = selectedPortfolio.currentValuation.amount;
  const availableCash = selectedPortfolio.availableCash.amount;
  const netEquityTotalCost = selectedPortfolio.costBasis.amount;
  // Holdings grouped by their own currency (accumulated from each
  // holding's currentValueLC). On the Investments card (compact), the
  // main "Total Balance" is this NGN accumulation rather than the
  // endpoint's own currentValuation (which folds every currency together)
  // — Trade keeps using currentValuation as-is. The USD figure is shown
  // as a smaller secondary balance under it; on Investments it always
  // shows (defaulting to $0.00), on Trade only when there's actually a
  // non-NGN balance, since holding foreign securities there is the
  // exception rather than the norm.
  const currencyBalances = getCurrencyBalances(selectedPortfolio);
  const balance = compact
    ? (currencyBalances.NGN ?? 0)
    : selectedPortfolio.currentValuation.amount;
  const dollarBalance = currencyBalances.USD ?? (compact ? 0 : undefined);

  return (
    <>
    <div
      className={`h-full border border-[#F4F4F4] rounded-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)] px-[20px] pt-[24px] pb-[24px] flex flex-col ${compact ? "justify-center" : ""}`}
    >
      <div className="flex justify-center">
        <PortfolioSelect
          portfolios={portfolios}
          selectedPortfolio={selectedPortfolio}
          onSelect={onSelectPortfolio as (portfolio: Portfolio | null) => void}
          isTrade={!compact}
        />
      </div>

      <div className="mt-[24px] flex items-center justify-center gap-[6px] text-center text-[13px] text-(--text-content-muted) font-medium">
        <span>Total Balance</span>
        {isRefreshingBalance && (
          <CircularProgress size={12} enableTrackSlot value={100} />
        )}
      </div>

      <div className="mt-[4px] flex justify-center items-center gap-[10px]">
        <span className="text-center font-bold text-(--text-content-default) text-[40px] leading-[52px] tracking-[-0.6px]">
          {showBalance ? formatCurrency(balance, "NGN", "en-NG") : "₦••••••"}
        </span>
        <button
          type="button"
          onClick={() => updateShowBalance(!showBalance)}
          aria-label={showBalance ? "Hide balance" : "Show balance"}
          className="cursor-pointer text-(--text-content-muted) hover:text-(--text-content-default)"
        >
          <i
            className={`${showBalance ? "ri-eye-line" : "ri-eye-off-line"} text-[22px]`}
          ></i>
        </button>
      </div>

      {dollarBalance !== undefined && (
        <div className="mt-[10px] flex justify-center">
          <div className="flex items-center gap-[8px] rounded-[999px] border border-[#B3EBED] bg-[#F0FAFB] px-[14px] py-[7px]">
            <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#00585E] text-[11px] font-bold text-white">
              $
            </span>
            <span className="text-[14px] font-bold text-(--text-content-default)">
              {showBalance
                ? formatCurrency(dollarBalance, "USD", "en-US")
                : "$••••"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-(--text-content-muted)">
              USD
            </span>
          </div>
        </div>
      )}

      {(selectedPortfolio?.portfolioHoldings?.length ?? 0) > 0 && (
        <div className="mt-[12px] flex justify-center">
          <Link to={breakdownHref}>
            <div className="flex gap-2 items-center cursor-pointer">
              <span className="font-semibold text-[#E77731] text-[14px] leading-[20px] tracking-[0.1px]">
                See breakdown
              </span>
              <i className="ri-arrow-right-s-line text-[18px] text-[#E77731]"></i>
            </div>
          </Link>
        </div>
      )}

      {!compact && (
        <>
          <div className="mt-[24px] border-t border-[#F4F4F4]"></div>

          <div className="mt-[24px] grid grid-cols-2 gap-y-[20px]">
            <StatCell
              label="Purchasing power"
              value={formatCurrency(purchasingPower, "NGN", "en-NG")}
              description="How much you can spend right now — your margin trading power if you have one, otherwise your available cash."
              showBalance={showBalance}
            />
            <StatCell
              label="Net Equity Value"
              value={formatCurrency(netEquityValue, "NGN", "en-NG")}
              description="The current total value of everything in this portfolio, cash and holdings combined."
              showBalance={showBalance}
            />
            <StatCell
              label="Available Cash"
              value={formatCurrency(availableCash, "NGN", "en-NG")}
              description="Uninvested cash sitting in this portfolio, ready to trade with."
              showBalance={showBalance}
            />
            <StatCell
              label="Net Equity Total Cost"
              value={formatCurrency(netEquityTotalCost, "NGN", "en-NG")}
              description="What you originally paid for everything currently held in this portfolio."
              showBalance={showBalance}
            />
          </div>

          <div className="mt-[32px] grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <Button
              variant="primary"
              disabled={false}
              isLoading={false}
              className="rounded-[99px] h-[52px] text-[14px] sm:text-[16px] whitespace-nowrap transition-transform active:scale-[0.98]"
              onClick={() => setOpenFundDialog(true)}
            >
              Fund Account
            </Button>
            <Button
              variant="empty"
              disabled={false}
              isLoading={false}
              className="rounded-[99px] h-[52px] text-[14px] sm:text-[16px] whitespace-nowrap border border-[#DCDCDC] transition-transform active:scale-[0.98]"
              onClick={() => setOpenWithdrawDialog(true)}
            >
              Withdraw to Wallet
            </Button>
          </div>
        </>
      )}
    </div>

    <PaymentGateway
      open={openFundDialog}
      setOpen={setOpenFundDialog}
      walletBalance={walletBalance}
      savedCards={savedCards}
      availablePartners={availablePartners}
      configs={paymentConfigs}
      isSubmitting={isFunding}
      onContinue={handleFundContinue}
    />
    <PaymentSuccess
      open={openFundSuccess}
      setOpen={(nextOpen) => {
        setOpenFundSuccess(nextOpen);
        if (!nextOpen) onRetry?.();
      }}
      amount={fundedAmount}
      title="Funding successful"
    />
    <WithdrawToWallet
      openDialog={openWithdrawDialog}
      setDialog={setOpenWithdrawDialog}
      availableBalance={availableCash}
      isSubmitting={isSendingOtp}
      onProceed={handleWithdrawProceed}
    />
    <OtpVerification
      openDialog={openOtpDialog}
      setDialog={setOpenOtpDialog}
      email={currentUser?.email ?? ""}
      title="Verify withdrawal"
      description="We sent a 6 digit code to your email"
      isSubmitting={isWithdrawing}
      isResending={isResendingOtp}
      onSubmit={handleOtpSubmit}
      onResend={handleResendOtp}
    />
    </>
  );
};

export default PortfolioBalanceCard;
