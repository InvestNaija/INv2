import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { toast } from "react-toastify";
import Button from "../../../../components/atoms/buttons";
import cardLogo from "../../../../assets/icons/Cardholder.svg";
import EmptyStateIcon from "../../../../components/atoms/empty-state-icon";
import visaLogo from "../../../../assets/icons/visa.png";
import mastercardLogo from "../../../../assets/icons/Mastercard_logo.webp";
import formatCurrency from "../../../../hooks/FormatCurrency";
import { encryptPassword } from "../../../../hooks/encryption";
import {
  isCreditLikeTransaction,
  getTransactionTitle,
  formatTransactionDate,
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
} from "../../../../hooks/transactionHelpers";
import TransactionDetails from "../../../../components/dialogs/transaction-details";
import WithdrawFunds from "../../../../components/dialogs/withdraw-funds";
import OtpVerification from "../../../../components/dialogs/otp-verification";
import AddCardModal from "../../../../components/dialogs/add-card";
import RemoveCardConfirmation from "../../../../components/dialogs/remove-card-confirmation";
import { useUser } from "../../../../contexts/userContext";
import WalletFeatures, {
  useWalletFeatures,
  type WalletTransaction,
} from "../../../../contexts/walletContext";
import PaymentGateway from "../../../../components/dialogs/payment-gateway";
import { type PaymentGatewayConfig, type FundWalletPayload } from "../../../../models/walletModel";
import { useSave } from "../../../../contexts/saveContext";

// The email a withdrawal's verification OTP is sent with — fixed subject
// and body per the backend's activity-verification flow.
const WITHDRAW_OTP_SUBJECT = "Verify Activity";
const WITHDRAW_OTP_MESSAGE =
  "<p>Please verify your request to withdraw from your wallet</p>";

// Where the backend redirects back to once a withdrawal completes.
const WITHDRAW_REDIRECT_URL = "https://app.investnaija.com/app/home/wallet";

const TRANSACTIONS_PAGE_SIZE = 5;

// Maps the card network name returned by the API (card.card_details.brand,
// e.g. "visa", "mastercard") to its official logo asset. Falls back to a
// generic card icon for any network without one.
const CARD_BRAND_LOGOS: Record<string, string> = {
  visa: visaLogo,
  mastercard: mastercardLogo,
};

// Transaction type filter options shown as pill tabs above the list.
// value is what's sent to the API ("" = no filter).
const TRANSACTION_FILTERS = [
  { label: "All", value: "" },
  { label: "Received", value: "credit" },
  { label: "Sent", value: "debit" },
] as const;

// Quick date-range shortcuts shown above the manual From/To pickers, so
// picking a common range doesn't require opening two calendars.
const DATE_PRESETS = [
  { label: "Today", getRange: (): [Dayjs, Dayjs] => [dayjs(), dayjs()] },
  {
    label: "Last 7 days",
    getRange: (): [Dayjs, Dayjs] => [dayjs().subtract(6, "day"), dayjs()],
  },
  {
    label: "Last 30 days",
    getRange: (): [Dayjs, Dayjs] => [dayjs().subtract(29, "day"), dayjs()],
  },
  {
    label: "This month",
    getRange: (): [Dayjs, Dayjs] => [dayjs().startOf("month"), dayjs()],
  },
] as const;

// Renders the wallet UI. Split out from Wallet so it mounts as a child of
// <WalletFeatures>, since a component can't consume a context provider that
// it itself renders further down its own JSX tree.
const WalletContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const trxref = searchParams.get('trxref');
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');
    const isSuccess = searchParams.get('success');
    const message = searchParams.get('message');
    
    if (isSuccess === 'false' || status === 'failed') {
      toast.error(message || "Transaction failed. Please try again.");
      searchParams.delete('trxref');
      searchParams.delete('reference');
      searchParams.delete('status');
      searchParams.delete('success');
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    } else if (status === 'successful' || status === 'success' || status === 'processing' || reference || trxref || isSuccess === 'true') {
      toast.success(message || "Wallet transaction was successful!");
      searchParams.delete('trxref');
      searchParams.delete('reference');
      searchParams.delete('status');
      searchParams.delete('success');
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { currentUser, updateShowBalance } = useUser();
  const { fetchPlaninList, fetchSaveinList } = useSave();
  const showBalance = currentUser?.show_balance ?? true;
  const {
    balance,
    vNuban,
    provider,
    isLoading,
    transactions,
    isLoadingTransactions,
    hasMoreTransactions,
    fetchTransactions,
    savedCards,
    isLoadingSavedCards,
    fetchSavedCards,
    refetchBalance,
    sendWithdrawOtp,
    submitWithdrawal,
    removeSavedCard,
    fetchPaymentGatewayOptions,
    initiateFundWallet
  } = useWalletFeatures();

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  // Label of the currently-applied quick preset (e.g. "Last 7 days"), so it
  // can be highlighted; cleared whenever a date is set manually or cleared.
  const [activePreset, setActivePreset] = useState<string | null>(null);
  // The date range picker is hidden by default and only appears once the
  // user opts into filtering by date, keeping the default view uncluttered.
  const [showDateFilter, setShowDateFilter] = useState(false);
  // Which transaction's tooltip (showing its full, un-shortened
  // description) is currently open, if any.
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  // The transaction currently shown in the details modal, if any.
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalletTransaction | null>(null);
  const [openTransactionDetails, setOpenTransactionDetails] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isDeletingCardId, setIsDeletingCardId] = useState<string | null>(null);
  
  // Payment Gateway — shared between "Add Card" (fixed trial-charge amount,
  // just to register a card) and "Add money" (a real top-up of whatever
  // amount the customer types) since both hit the same wallet-fund
  // endpoint; this just tracks which one opened the dialog so it renders
  // in the right mode.
  const [openAddCardGateway, setOpenAddCardGateway] = useState(false);
  const [isAddMoneyMode, setIsAddMoneyMode] = useState(false);
  const [addCardGatewayConfigs, setAddCardGatewayConfigs] = useState<PaymentGatewayConfig[]>([]);
  const [addCardAvailablePartners, setAddCardAvailablePartners] = useState<string[]>([]);
  const [isLoadingAddCardConfigs, setIsLoadingAddCardConfigs] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Withdraw-funds flow: amount+password modal -> email OTP -> submit.
  const [openWithdrawDialog, setWithdrawDialog] = useState(false);
  const [openOtpDialog, setOtpDialog] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  // Carries the amount + already-encrypted password from the first modal
  // to the OTP step, where they're needed again for the actual withdraw
  // request (the OTP modal itself only ever handles the 6-digit code).
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    amount: number;
    encryptedPassword: string;
  } | null>(null);

  const handleOpenTransactionDetails = (transaction: WalletTransaction) => {
    setSelectedTransaction(transaction);
    setOpenTransactionDetails(true);
  };

  // Extracts a human-readable message from a failed axios request, falling
  // back to a generic message when the response doesn't carry one.
  const getErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError(error)
      ? (error.response?.data?.message ?? error.message ?? fallback)
      : fallback;

  const handleDeleteCard = async () => {
    if (!cardToDelete) return;
    setIsDeletingCardId(cardToDelete);
    try {
      await removeSavedCard(cardToDelete);
      toast.success("Card removed successfully");
      setCardToDelete(null);
      await fetchSavedCards(); // Refresh the list
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove card"));
    } finally {
      setIsDeletingCardId(null);
    }
  };

  // Step 1: user enters an amount + their password. Encrypts the password,
  // then emails a verification OTP before revealing the OTP modal — the
  // actual withdrawal isn't submitted until that code is confirmed.
  const handleWithdrawContinue = async (amount: number, password: string) => {
    if (!currentUser?.email) {
      toast.error("Unable to verify your email. Please refresh and try again.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const encryptedPassword = await encryptPassword(
        password,
        import.meta.env.VITE_PUBLIC_KEY,
      );
      await sendWithdrawOtp({
        email: currentUser.email,
        subject: WITHDRAW_OTP_SUBJECT,
        message: WITHDRAW_OTP_MESSAGE,
      });
      setPendingWithdrawal({ amount, encryptedPassword });
      setWithdrawDialog(false);
      setOtpDialog(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send verification code"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Re-sends the same verification email if the OTP modal's "Resend code"
  // is clicked.
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
      toast.error(getErrorMessage(error, "Failed to resend verification code"));
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Step 2: the OTP is confirmed — submit the actual withdrawal using the
  // amount/password captured in step 1 plus the code just entered.
  const handleOtpSubmit = async (otp: string) => {
    if (!currentUser?.email || !pendingWithdrawal) return;

    setIsWithdrawing(true);
    try {
      await submitWithdrawal({
        email: currentUser.email,
        resendOtp: false,
        signature: "",
        amount: pendingWithdrawal.amount,
        password: pendingWithdrawal.encryptedPassword,
        currency: "NGN",
        gateway: "wallet",
        channel: "wallet",
        source: "wallet",
        type: "debit",
        redirect_url: WITHDRAW_REDIRECT_URL,
        token: otp,
      });
      toast.success("Withdrawal successful");
      setOtpDialog(false);
      setPendingWithdrawal(null);
      // Refresh both the balance and the transaction list so the new debit
      // shows up without the user needing to reload.
      refetchBalance();
      fetchTransactions({
        page: 1,
        size: TRANSACTIONS_PAGE_SIZE,
        type: typeFilter,
        start: startDate ? startDate.format("YYYY-MM-DD") : "",
        end: endDate ? endDate.format("YYYY-MM-DD") : "",
      });
      setPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Withdrawal failed. Please try again."));
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Closes the open tooltip when clicking anywhere outside a transaction
  // title — MUI's Tooltip doesn't add this listener itself once hover/focus
  // triggers are disabled in favor of click-to-open.
  useEffect(() => {
    if (!openTooltipId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-transaction-title]")) {
        setOpenTooltipId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openTooltipId]);

  // Re-fetch whenever the page, type filter, or date range changes (this
  // also covers the very first load, since it runs on mount too). A lone
  // start or end date is an incomplete range — wait for both sides (or
  // neither) before hitting the API, rather than filtering on a half-picked
  // date.
  useEffect(() => {
    const hasPartialRange = Boolean(startDate) !== Boolean(endDate);
    if (hasPartialRange) return;

    fetchTransactions({
      page,
      size: TRANSACTIONS_PAGE_SIZE,
      type: typeFilter,
      start: startDate ? startDate.format("YYYY-MM-DD") : "",
      end: endDate ? endDate.format("YYYY-MM-DD") : "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter, startDate, endDate]);

  // Switching filters starts back at page 1 — staying on, say, page 3 of
  // "All" while filtering to "Sent" would likely show an empty/confusing page.
  const handleFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleStartDateChange = (value: Dayjs | null) => {
    setStartDate(value);
    setActivePreset(null);
    setPage(1);
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    setEndDate(value);
    setActivePreset(null);
    setPage(1);
  };

  const handlePresetClick = (preset: (typeof DATE_PRESETS)[number]) => {
    const [start, end] = preset.getRange();
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset.label);
    setPage(1);
  };

  // Copies the wallet's funding account number so the user can paste it
  // into their banking app to transfer money in.
  const handleCopyNuban = async () => {
    if (!vNuban) return;
    try {
      await navigator.clipboard.writeText(vNuban);
      toast.success("Account number copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const fetchAddCardConfigs = async () => {
    setIsLoadingAddCardConfigs(true);
    try {
      let planId = "0a4b6e23-cfa8-4d8f-9990-ceb6dbefb99d"; // Default fallback to user provided ID
      try {
        const plansRes = await fetchPlaninList();
        if (plansRes.data && plansRes.data.rows && plansRes.data.rows.length > 0) {
          planId = plansRes.data.rows[0].id;
        } else {
          const saveRes = await fetchSaveinList();
          if (saveRes.data && saveRes.data.rows && saveRes.data.rows.length > 0) {
            planId = saveRes.data.rows[0].id;
          }
        }
      } catch (err) {
        console.error("Failed to fetch save plans for gateway config fallback");
      }
      
      const res = await fetchPaymentGatewayOptions("saveplan", planId);
      setAddCardGatewayConfigs(res.data || []);
      setAddCardAvailablePartners((res.data || []).map((c: PaymentGatewayConfig) => c.gateway));
    } catch (error) {
      toast.error("Failed to load payment options");
    } finally {
      setIsLoadingAddCardConfigs(false);
    }
  };

  const handleAddCardProceed = () => {
    setIsAddCardModalOpen(false);
    setIsAddMoneyMode(false);
    setOpenAddCardGateway(true);
    fetchAddCardConfigs();
  };

  const handleAddMoneyClick = () => {
    setIsAddMoneyMode(true);
    setOpenAddCardGateway(true);
    fetchAddCardConfigs();
  };

  const handleAddCardGatewayContinue = async (
    amount: number,
    method: string,
    partner?: string,
    _cardId?: string,
    _receiptFile?: File,
    saveCard?: boolean
  ) => {
    if (!partner) return;
    setIsAddingCard(true);
    try {
      const selectedConfig = addCardGatewayConfigs.find(c => c.gateway === partner);
      const gatewayId = selectedConfig?.id || "cd806539-b77d-40fb-879c-98ca4a4c07a4";

      const payload: FundWalletPayload = {
          amount: amount,
          paymentMethod: method,
          gateway: partner,
          id: "65e9d192-e7d6-4f8d-89a2-e0c79f3f7801",
          currency: "NGN",
          source: "wallet",
          type: "credit",
          description: "Wallet Deposit",
          redirect_url: window.location.origin + "/app/home/wallet",
          post_url: "https://invest-chd.zanibal.com/api/v1/transactions/wallet/fund",
          callback_params: {
              module: "saveplan",
              asset_id: "65e9d192-e7d6-4f8d-89a2-e0c79f3f7801",
              gateway_id: gatewayId,
              saveCard: !!saveCard,
              brokerageInfo: {}
          },
          gateway_params: {
              channels: ["card"]
          },
          show: true,
          gateway_id: gatewayId,
          channel: partner,
          channels: ["card", "bank_transfer"]
      };
      
      const response = await initiateFundWallet(payload);
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
         toast.success(`Transaction initiated successfully.`);
         setOpenAddCardGateway(false);
         setIsAddingCard(false);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to initiate transaction"));
      setIsAddingCard(false);
    }
  };

  return (
    <>
      <TransactionDetails
        openDialog={openTransactionDetails}
        setDialog={setOpenTransactionDetails}
        transaction={selectedTransaction}
      />
      <WithdrawFunds
        openDialog={openWithdrawDialog}
        setDialog={setWithdrawDialog}
        availableBalance={balance}
        isSubmitting={isSendingOtp}
        onContinue={handleWithdrawContinue}
      />
      <OtpVerification
        openDialog={openOtpDialog}
        setDialog={setOtpDialog}
        email={currentUser?.email ?? ""}
        title="Confirm withdrawal"
        description="We sent a 6 digit code to your email"
        isSubmitting={isWithdrawing}
        isResending={isResendingOtp}
        onSubmit={handleOtpSubmit}
        onResend={handleResendOtp}
      />
      <div className="overview-wrapper mt-[32px]">
        <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="col-1-wrapper">
              <div className="border border-(--border-default) rounded-[20px] p-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-bold">
                      Wallet
                    </p>
                  </div>
                </div>
                <div className="mt-[40px] flex items-center gap-[10px] text-(--text-content-default) text-[32px] leading-[44px] tracking-[-0.4px] font-semibold">
                  {isLoading ? (
                    <div className="h-10 w-32 bg-[#F0F0F0] rounded animate-pulse" />
                  ) : (
                    <>
                      <span>
                        {showBalance ? formatCurrency(balance, "NGN") : "₦••••••"}
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
                    </>
                  )}
                </div>

                {/* Funding instructions: the dedicated virtual account
                    customers transfer into to top up their wallet. */}
                {vNuban && (
                  <div className="flex items-center justify-between gap-2 mt-[16px] px-[12px] py-[10px] rounded-[12px] bg-[#F5FBFB] border border-[#E0F6F7]">
                    <div className="flex items-center gap-[10px]">
                      <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-white">
                        <i className="ri-bank-line text-[16px] text-[#00727A]"></i>
                      </div>
                      <div className="flex flex-col">
                        {provider && (
                          <span className="text-(--text-content-muted) text-[11px] leading-[14px] tracking-[0.2px] font-medium">
                            {provider}
                          </span>
                        )}
                        <span className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.5px] font-semibold">
                          {vNuban}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyNuban}
                      aria-label="Copy account number"
                      className="cursor-pointer p-[8px] rounded-full hover:bg-white"
                    >
                      <i className="ri-file-copy-line text-[16px] text-[#00727A]"></i>
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mt-[32px]">
                  <Button
                    variant="ghost"
                    disabled={false}
                    isLoading={false}
                    className="flex-1 border border-[#B3EBED] rounded-[99px] px-[12px] h-[48px] transition-transform active:scale-[0.98]"
                    onClick={handleAddMoneyClick}
                  >
                <div className="flex gap-2 items-center justify-center whitespace-nowrap">
                  <i className="ri-add-line text-[20px] sm:text-[24px] text-[#00727A]"></i> <span>Add money</span>
                  </div>
                  </Button>

                  <Button
                    variant="ghost"
                    disabled={false}
                    isLoading={false}
                    className="flex-1 border border-[#B3EBED] rounded-[99px] px-[12px] h-[48px] transition-transform active:scale-[0.98]"
                    onClick={() => {
                      if (balance <= 0) {
                        toast.info("You have no funds available to withdraw.");
                        return;
                      }
                      setWithdrawDialog(true);
                    }}
                  >
                     <div className="flex gap-2 items-center justify-center whitespace-nowrap">
                  <i className="ri-arrow-down-line text-[20px] sm:text-[24px] text-[#00727A]"></i> <span>Withdraw</span>
                  </div>
                  </Button>
                </div>

                {/* <div className="mt-[40px] text-(--text-content-muted) text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                      <span>Upcoming investment orders</span>
                </div> */}
              </div>

              <div className="border border-(--border-default) rounded-[20px] p-[20px] mt-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[12px] pt-[8px] pb-[16px]">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    Wallet Transactions
                  </p>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex gap-[4px] p-[4px] rounded-[99px] bg-(--surface-subtle)">
                      {TRANSACTION_FILTERS.map((filter) => (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => handleFilterChange(filter.value)}
                          className={`px-[10px] sm:px-[12px] py-[6px] rounded-[99px] text-[12px] leading-[16px] tracking-[0.2px] font-medium cursor-pointer whitespace-nowrap transition-colors ${
                            typeFilter === filter.value
                              ? "bg-[#00585E] text-white"
                              : "text-(--text-content-muted)"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    {/* Toggles the date-range picker below; kept hidden by
                        default so it doesn't clutter the default view. */}
                    <button
                      type="button"
                      onClick={() => setShowDateFilter((prev) => !prev)}
                      aria-label="Toggle date filter"
                      aria-expanded={showDateFilter}
                      className={`flex shrink-0 items-center justify-center h-[32px] w-[32px] rounded-full cursor-pointer transition-colors ${
                        showDateFilter || startDate || endDate
                          ? "bg-[#00585E] text-white"
                          : "bg-(--surface-subtle) text-(--text-content-muted)"
                      }`}
                    >
                      <i className="ri-calendar-line text-[16px]"></i>
                    </button>
                  </div>
                </div>

                {/* Date range filter, applied alongside the type pills above.
                    Only shown once the user clicks the calendar toggle. */}
                {showDateFilter && (
                  <div className="relative flex flex-col gap-[16px] mb-[16px] p-[16px] pl-[16px] rounded-[28px] bg-[#F5FBFB] border border-[#B3EBED] shadow-[0_2px_12px_rgba(0,88,94,0.08)] overflow-hidden">
                    {/* Accent stripe: gives the panel a clear visual edge so
                        it reads as an active, "opened" filter panel rather
                        than blending into the surrounding card. */}
                    {/* <div className="absolute left-0 top-0 h-full w-[4px] bg-[#00585E]"></div> */}

                    {/* Quick presets cover the common cases in one click;
                        the pickers below are there for anything else. */}
                    <div className="flex flex-wrap gap-[8px]">
                      {DATE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`px-[12px] py-[6px] rounded-[99px] text-[12px] font-semibold cursor-pointer transition-colors ${
                            activePreset === preset.label
                              ? "bg-[#00585E] text-white"
                              : "bg-white text-(--text-content-default) border border-[#B3EBED]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-[10px] p-[12px] rounded-[12px] bg-white/70 border border-[#B3EBED]">
                      <div className="flex items-center gap-[6px] px-[14px]">
                        {/* <i className="ri-calendar-2-fill text-[14px] text-[#00585E]"></i> */}
                        <span className="text-[#00585E] text-[11px] leading-[14px] tracking-[0.3px] font-bold uppercase">
                          Custom range
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-[10px]">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="From"
                            value={startDate}
                            onChange={handleStartDateChange}
                            maxDate={endDate ?? undefined}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                sx: {
                                  minWidth: { xs: "100%", sm: "180px" },
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    background: "#fff",
                                  },
                                  "& .MuiOutlinedInput-root fieldset": {
                                    borderColor: "#B3EBED",
                                  },
                                  "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: "#26C8D1",
                                  },
                                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                                    borderColor: "#00585E",
                                  },
                                },
                              },
                              field: { clearable: true },
                            }}
                          />
                          <i className="ri-arrow-right-line hidden sm:block text-[16px] text-(--text-content-muted)"></i>
                          <DatePicker
                            label="To"
                            value={endDate}
                            onChange={handleEndDateChange}
                            minDate={startDate ?? undefined}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                sx: {
                                  minWidth: { xs: "100%", sm: "180px" },
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    background: "#fff",
                                  },
                                  "& .MuiOutlinedInput-root fieldset": {
                                    borderColor: "#B3EBED",
                                  },
                                  "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: "#26C8D1",
                                  },
                                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                                    borderColor: "#00585E",
                                  },
                                },
                              },
                              field: { clearable: true },
                            }}
                          />
                        </LocalizationProvider>
                        {/* {(startDate || endDate) && (
                          <button
                            type="button"
                            onClick={handleClearDateRange}
                            className="flex items-center gap-1 text-[#00727A] text-[13px] font-semibold cursor-pointer hover:underline whitespace-nowrap"
                          >
                            <i className="ri-close-circle-line text-[15px]"></i>
                            Clear dates
                          </button>
                        )} */}
                      </div>
                    </div>
                  </div>
                )}

                <Divider />
                {isLoadingTransactions ? (
                  <div className="flex flex-col px-[20px] py-[20px] gap-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-[#F0F0F0]" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="h-3 bg-[#F0F0F0] rounded w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="empty-data-wrapper">
                    <div className="flex justify-center py-[64px]">
                      <div className="empty-data-content">
                        <div className="flex justify-center">
                          <EmptyStateIcon size={64} icon="ri-exchange-line" />
                        </div>
                        <div className="text-center mt-[12px] mb-[3px] text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                          <span>No transactions yet.</span>
                        </div>
                        <div className="text-center text-(--text-content-muted) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                          <span>Your transactions will appear here.</span>
                        </div>
                        <div></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  transactions.map((transaction: WalletTransaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => handleOpenTransactionDetails(transaction)}
                      className="py-[16px] px-2 flex justify-between items-center cursor-pointer border-b border-[#F4F4F4] last:border-0 hover:bg-[#F9F9F9] transition-colors rounded-lg -mx-2"
                    >
                      <div className="flex gap-3 items-center">
                        <div className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${isCreditLikeTransaction(transaction) ? "bg-[#E6F4EA]" : "bg-[#FCE8E6]"}`}>
                          <i
                            className={
                              isCreditLikeTransaction(transaction)
                                ? "ri-arrow-right-down-line text-[20px] text-[#0D904F]"
                                : "ri-arrow-right-up-line text-[20px] text-[#D93025]"
                            }
                          ></i>
                        </div>
                        <div className="flex flex-col">
                          <Tooltip
                            title={transaction.description}
                            open={openTooltipId === transaction.id}
                            disableFocusListener
                            disableTouchListener
                            arrow
                            placement="top"
                          >
                            <span
                              data-transaction-title
                              onClick={(e) => {
                                // Don't also open the details modal — this
                                // click is just for the quick-peek tooltip.
                                e.stopPropagation();
                                setOpenTooltipId((prev) =>
                                  prev === transaction.id ? null : transaction.id,
                                );
                              }}
                              onMouseEnter={() => setOpenTooltipId(transaction.id)}
                              onMouseLeave={() =>
                                setOpenTooltipId((prev) =>
                                  prev === transaction.id ? null : prev,
                                )
                              }
                              className="text-(--text-content-default) text-left text-[14px] leading-[20px] tracking-[0.1px] font-medium cursor-pointer w-fit"
                            >
                              {getTransactionTitle(transaction.description)}
                            </span>
                          </Tooltip>
                          <span className="text-(--text-content-muted) text-left text-[12px] leading-[16px] tracking-[0.2px] font-medium capitalize">
                            {transaction.type} • {formatTransactionDate(transaction.post_date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-semibold text-[14px] leading-[20px] tracking-[0.1px] text-(--text-content-default)">
                          {showBalance ? (
                            <>
                              {isCreditLikeTransaction(transaction) ? "" : "-"}
                              {formatCurrency(transaction.amount, transaction.currency || "NGN", "en-NG")}
                            </>
                          ) : "₦••••"}
                        </span>
                        <div
                          className="inline-flex items-center justify-center rounded-[6px] px-[10px] py-[3px] text-[12px] font-bold capitalize mt-1"
                          style={{
                            color: STATUS_STYLES[transaction.status?.toLowerCase() || ""]?.text || DEFAULT_STATUS_STYLE.text,
                            backgroundColor: STATUS_STYLES[transaction.status?.toLowerCase() || ""]?.bg || DEFAULT_STATUS_STYLE.bg,
                            border: `1px solid ${STATUS_STYLES[transaction.status?.toLowerCase() || ""]?.text || DEFAULT_STATUS_STYLE.text}`
                          }}
                        >
                          {transaction.status || "Unknown"}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Pagination: the API doesn't return a total count, so
                    "Next" is enabled only when the last page came back full
                    (a strong hint there's more), rather than showing exact
                    page counts. */}
                {!isLoadingTransactions && (transactions.length > 0 || page > 1) && (
                  <div className="flex items-center justify-between mt-[16px] pt-[16px] border-t border-(--border-default)">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-[12px] py-[8px] rounded-[8px] text-[13px] font-medium text-(--text-content-default) disabled:text-(--text-content-muted) disabled:cursor-not-allowed cursor-pointer hover:bg-(--surface-subtle)"
                    >
                      <i className="ri-arrow-left-s-line text-[18px]"></i>
                      Previous
                    </button>
                    <span className="text-[13px] text-(--text-content-muted) font-medium">
                      Page {page}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={!hasMoreTransactions}
                      className="flex items-center gap-1 px-[12px] py-[8px] rounded-[8px] text-[13px] font-medium text-(--text-content-default) disabled:text-(--text-content-muted) disabled:cursor-not-allowed cursor-pointer hover:bg-(--surface-subtle)"
                    >
                      Next
                      <i className="ri-arrow-right-s-line text-[18px]"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 xs:col-span-2 col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1">
            <div className="col-2-wrapper">
              <div className="border border-(--border-default) rounded-[20px] p-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
                <div className="pt-[8px] pb-[16px]">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    Saved cards
                  </p>
                </div>
                <Divider />

                {isLoadingSavedCards ? (
                  <div className="flex flex-col px-[20px] py-[20px] gap-4 animate-pulse">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-[#F0F0F0]" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : savedCards.length === 0 ? (
                  <div className="empty-data-wrapper">
                    <div className="flex justify-center py-[40px]">
                      <div className="empty-data-content">
                        <div className="flex justify-center">
                          <img
                            src={cardLogo}
                            height="46"
                            width="46"
                            className="text-black"
                            alt="Empty Logo"
                          />
                        </div>
                        <div className="text-center mt-[20px] text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.28px] font-semibold">
                          <span>Find your cards here</span>
                        </div>
                        <div className="text-center mt-[2px] mb-[20px] text-(--text-content-muted) text-[12px] leading-[16px] tracking-[-0.12px] font-medium">
                          <span>You have no cards</span>
                        </div>
                        <div>
                          <Button
                            variant="empty"
                            disabled={false}
                            isLoading={false}
                            className="border border[1.5px] border-[#E5E5E5] rounded-[12px] py-[8px] px-[16px]"
                            onClick={() => setIsAddCardModalOpen(true)}
                          >
                            Add card
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[12px] pt-[8px]">
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        className="group relative flex items-center justify-between p-[16px] rounded-[16px] border border-[#E5E5E5] bg-white hover:border-[#00585E] hover:shadow-[0_8px_24px_rgba(0,88,94,0.08)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-[16px]">
                          <div className="flex h-[48px] w-[64px] shrink-0 items-center justify-center rounded-[12px] bg-[#F8FAFC] border border-[#F1F5F9] shadow-inner">
                            {CARD_BRAND_LOGOS[card.card_details.brand.toLowerCase()] ? (
                              <img
                                src={CARD_BRAND_LOGOS[card.card_details.brand.toLowerCase()]}
                                alt={card.card_details.brand}
                                className="h-[28px] w-[40px] object-contain drop-shadow-sm"
                              />
                            ) : (
                              <i className="ri-bank-card-2-line text-[24px] text-(--text-content-muted)"></i>
                            )}
                          </div>
                          <div className="flex flex-col gap-[2px]">
                            <span className="text-[#0F172A] text-[15px] leading-[20px] font-bold tracking-tight">
                              •••• {card.card_details.last_4digits}
                            </span>
                            <span className="text-[#64748B] text-[13px] leading-[18px] font-medium capitalize">
                              {card.card_details.brand} Debit
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setCardToDelete(card.id)}
                          disabled={isDeletingCardId === card.id}
                          className="cursor-pointer flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white text-[#94A3B8] hover:bg-[#FEE2E2] hover:text-[#EF4444] border border-transparent hover:border-[#FCA5A5] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
                          title="Remove Card"
                        >
                          {isDeletingCardId === card.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <i className="ri-delete-bin-line text-[18px]"></i>
                          )}
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => setIsAddCardModalOpen(true)}
                      className="mt-[4px] flex w-full items-center justify-center gap-[8px] rounded-[16px] border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-[16px] text-[#475569] hover:border-[#00585E] hover:bg-[#F5FBFB] hover:text-[#00585E] transition-all duration-300 font-semibold text-[14px] cursor-pointer"
                    >
                      <i className="ri-add-line text-[20px]"></i>
                      Add another card
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AddCardModal 
        open={isAddCardModalOpen} 
        setOpen={setIsAddCardModalOpen} 
        onProceed={handleAddCardProceed} 
      />

      <PaymentGateway
        open={openAddCardGateway}
        setOpen={setOpenAddCardGateway}
        title={isAddMoneyMode ? "Add Money" : "Add Card"}
        fixedAmount={isAddMoneyMode ? undefined : 50}
        savedCards={[]}
        availablePartners={addCardAvailablePartners}
        configs={addCardGatewayConfigs}
        isLoadingConfigs={isLoadingAddCardConfigs}
        onRefresh={fetchAddCardConfigs}
        onContinue={handleAddCardGatewayContinue}
        isAddCardMode={!isAddMoneyMode}
        hideWalletOption={isAddMoneyMode}
        isSubmitting={isAddingCard}
      />

      <RemoveCardConfirmation
        openRemoveCardDialog={!!cardToDelete}
        setRemoveCardDialog={(open) => !open && setCardToDelete(null)}
        onConfirmRemove={handleDeleteCard}
        isLoading={!!isDeletingCardId}
      />
    </>
  );
};

const Wallet = () => <WalletContent />;

export default Wallet;
