import axios from "axios";
import type {
  ActivityOtpResponse,
  CustomerCardsResponse,
  SendActivityOtpPayload,
  WalletBalanceResponse,
  WalletTransactionsResponse,
  WithdrawFundsPayload,
  WithdrawFundsResponse,
  ThirdPartyCustomerCardsResponse,
  PaymentGatewayConfigResponse,
  FundWalletPayload,
  FundWalletResponse,
} from "../models/walletModel";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Fetches the customer's wallet balance plus its funding virtual account
// (vNuban) from the backend.
const getWalletBalance = async (): Promise<WalletBalanceResponse> => {
  const response = await axios.get<WalletBalanceResponse>(
    `${baseUrl}/transactions/wallet/balance`,
  );
  return response.data;
};

export interface GetWalletTransactionsParams {
  page: number;
  size: number;
  type: string;
  start: string;
  end: string;
}

// Fetches a page of the wallet's transaction history (money in/out via bank
// transfer, trading, card top-ups, etc.) for the "Wallet Transactions" list.
// `type` filters to "credit"/"debit" (empty string = all); `start`/`end`
// filter by date range (empty string = unbounded).
const getWalletTransactions = async (
  params: GetWalletTransactionsParams,
): Promise<WalletTransactionsResponse> => {
  const response = await axios.get<WalletTransactionsResponse>(
    `${baseUrl}/transactions/my-transactions`,
    { params: { source: "wallet", ...params } },
  );
  return response.data;
};

// Fetches the customer's saved payment cards for the "Saved cards" list.
const getSavedCards = async (): Promise<CustomerCardsResponse> => {
  const response = await axios.get<CustomerCardsResponse>(
    `${baseUrl}/transactions/customer/cards`,
  );
  return response.data;
};

// Fetches the customer's saved cards from the 3rd-party payment gateway
// provider directly (Paystack), keyed by the customer's own id — used for
// the "pay with a saved card" option in the payment gateway modal.
const getGatewaySavedCards = async (
  customerId: string,
): Promise<ThirdPartyCustomerCardsResponse> => {
  const response = await axios.get<ThirdPartyCustomerCardsResponse>(
    `${baseUrl}/3rd-party-services/get-customer-cards`,
    { params: { id: customerId } },
  );
  return response.data;
};

// Fetches which payment partner(s) are actually configured for a given
// funding module (e.g. "tradein" for funding a trade portfolio), scoped by
// its fixed asset id — the payment gateway modal only offers whatever
// comes back here instead of assuming every partner is always available.
const getPaymentGatewayOptions = async (
  modules: string,
  assetId: string,
): Promise<PaymentGatewayConfigResponse> => {
  const response = await axios.get<PaymentGatewayConfigResponse>(
    `${baseUrl}/3rd-party-services/gateway`,
    { params: { modules, id: assetId } },
  );
  return response.data;
};

// Sends a one-time verification code to the customer's email before a
// sensitive wallet action (a withdrawal) is allowed to proceed.
const sendActivityOtp = async (
  payload: SendActivityOtpPayload,
): Promise<ActivityOtpResponse> => {
  const response = await axios.post<ActivityOtpResponse>(
    `${baseUrl}/auth/customers/resend-otp`,
    payload,
  );
  return response.data;
};

// Submits a wallet withdrawal once the customer has confirmed it with the
// OTP sent via sendActivityOtp.
const withdrawFunds = async (
  payload: WithdrawFundsPayload,
): Promise<WithdrawFundsResponse> => {
  const response = await axios.post<WithdrawFundsResponse>(
    `${baseUrl}/transactions/withdraw-funds`,
    payload,
  );
  return response.data;
};

// Initializes a wallet funding transaction (e.g. adding a new card)
const fundWallet = async (
  payload: FundWalletPayload,
): Promise<FundWalletResponse> => {
  const response = await axios.post<FundWalletResponse>(
    `${baseUrl}/transactions/wallet/fund`,
    payload,
  );
  return response.data;
};

// Deletes a saved card
const deleteSavedCard = async (cardId: string): Promise<void> => {
  await axios.delete(`${baseUrl}/transactions/customer/cards/${cardId}`);
};

export {
  getWalletBalance,
  getWalletTransactions,
  getSavedCards,
  getGatewaySavedCards,
  getPaymentGatewayOptions,
  sendActivityOtp,
  withdrawFunds,
  fundWallet,
  deleteSavedCard,
};
