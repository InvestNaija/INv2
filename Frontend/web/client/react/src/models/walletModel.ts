// The bank-issued virtual account customers fund their wallet through.
export interface VirtualAccount {
  provider: string;
  type: string;
  status: string;
  id: string;
  nuban: string;
  amount: number;
  expiresAt: string | null;
}

export interface FundWalletPayload {
  amount: number;
  paymentMethod: string;
  gateway: string;
  id: string;
  currency: string;
  source: string;
  type: string;
  description: string;
  redirect_url: string;
  post_url: string;
  callback_params: {
    module: string;
    asset_id: string;
    gateway_id: string;
    saveCard: boolean;
    brokerageInfo: Record<string, never>;
  };
  gateway_params: {
    channels: string[];
  };
  show: boolean;
  gateway_id: string;
  channel: string;
  channels: string[];
}

export interface FundWalletResponse {
  code: number;
  status: string;
  message?: string;
  data: {
    authorization_url?: string;
  };
}

// A customer's subscription/membership record for a save plan (the wallet
// is itself modeled as a save plan on the backend, hence the naming).
export interface SavePlanUser {
  id: string;
  parent_id: string | null;
  saveplan_id: string;
  customer_id: string;
  currency: string | null;
  title: string;
  description: string;
  pmt: number;
  frequency: string;
  duration: number;
  future_value: number;
  total_contribution_amount: number;
  interest: number;
  interest_rate: number;
  payment_method: string;
  accrued_interest: number;
  start_date: string;
  end_date: string;
  next_billing_date: string;
  total_paid: number;
  total_principal: number;
  status: string;
  gateway: string;
  cancel_date: string | null;
  virtualAccounts: VirtualAccount[];
}

// Metadata identifying which save-plan "calculator" (product type) this
// plan uses — for the wallet, always type_name: "wallet".
export interface SavePlanCalculatorType {
  id: string;
  type_name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// The wallet's underlying save-plan record, as returned in the `data` field
// of GET /transactions/wallet/balance.
export interface WalletPlan {
  id: string;
  title: string;
  type: string;
  currency: string;
  description: string;
  interest_rate: number;
  saveplan_users: SavePlanUser[];
  saveplan_calculator_type: SavePlanCalculatorType;
  saveplan_charge_types: unknown[];
}

// Full shape of GET /transactions/wallet/balance.
export interface WalletBalanceResponse {
  code: number;
  status: string;
  message: string;
  balance: number;
  vNuban: string;
  data: WalletPlan;
}

// One entry in the wallet's transaction history. The real API response
// carries a lot more (gateway_response, signature, transaction_invest,
// etc.) — only the fields the "Wallet Transactions" list actually renders
// are modeled here.
export interface WalletTransaction {
  id: string;
  reference: string;
  description: string;
  currency: string;
  amount: number;
  status: string;
  type: string;
  source: string;
  channel: string;
  module: string;
  post_date: string;
  createdAt: string;
}

// Full shape of GET /transactions/my-transactions?source=wallet.
export interface WalletTransactionsResponse {
  code: number;
  status: string;
  message: string;
  data: WalletTransaction[];
}

// Card-network/issuer details for a saved payment card.
export interface CardDetails {
  first_6digits: string;
  last_4digits: string;
  country: string;
  brand: string;
  channel: string;
  authorization_code: string;
  signature: string;
  expiry: string;
  account_name: string;
  reusable: boolean;
}

export interface SavedCard {
  id: string;
  saveCard?: string;
  customer_id: string;
  gateway: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  card_details: CardDetails;
}

// Full shape of GET /transactions/customer/cards. Only `data.cards` is used
// by the "Saved cards" list — the rest of `data` is the customer's own
// profile fields, already available (and used) via UserContext.
export interface CustomerCardsResponse {
  code: number;
  status: string;
  data: {
    id: string;
    cards: SavedCard[];
  };
}

// Full shape of GET /3rd-party-services/get-customer-cards?id={customerId}
// — a different endpoint/envelope from the one above (data is the card
// array directly, not nested under `.cards`), but the same SavedCard shape.
// Used for the "pay with a saved card" option in the payment gateway.
export interface ThirdPartyCustomerCardsResponse {
  success: boolean;
  code: number;
  data: SavedCard[];
}

// One entry from GET /3rd-party-services/gateway?modules={module}&id={id}
// — which payment partner(s) are actually configured for a given funding
// module (e.g. "tradein" for funding a trade portfolio). Only `gateway` is
// rendered; the payment gateway modal shows exactly these options instead
// of assuming every partner is always available.
export interface PaymentGatewayConfig {
  id: string;
  gateway: string;
  type: string;
  details?: string | null;
  name?: string;
  logo?: string | null;
  business_secret?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
  name_on_account?: string | null;
  asset_id?: string | null;
  bank_code?: string | null;
}

export interface PaymentGatewayConfigResponse {
  code: number;
  success: boolean;
  data: PaymentGatewayConfig[];
}

// State shape backing WalletContext (see contexts/walletContext.tsx).
export interface WalletState {
  balance: number;
  vNuban: string | null;
  provider: string | null;
  isLoading: boolean;
  transactions: WalletTransaction[];
  isLoadingTransactions: boolean;
  // Whether the last fetch returned a full page — i.e. there's likely
  // another page after it. The API doesn't return a total count, so this
  // is inferred from `data.length === size` rather than known for certain.
  hasMoreTransactions: boolean;
  savedCards: SavedCard[];
  isLoadingSavedCards: boolean;
  transactionsCache: Record<string, { transactions: WalletTransaction[], hasMore: boolean }>;
  cardsCache: SavedCard[] | null;
}

// Actions handled by walletContext's reducer.
export type WalletAction =
  | { type: "FETCH_WALLET_BALANCE_START" }
  | {
      type: "FETCH_WALLET_BALANCE_SUCCESS";
      payload: { balance: number; vNuban: string; provider: string | null };
    }
  | { type: "FETCH_WALLET_BALANCE_FAILURE" }

  | { type: "FETCH_WALLET_TRANSACTIONS_START" }
  | {
      type: "FETCH_WALLET_TRANSACTIONS_SUCCESS";
      payload: { transactions: WalletTransaction[]; hasMore: boolean };
    }
  | { type: "FETCH_WALLET_TRANSACTIONS_FAILURE" }

  | { type: "FETCH_SAVED_CARDS_START" }
  | { type: "FETCH_SAVED_CARDS_SUCCESS"; payload: SavedCard[] }
  | { type: "FETCH_SAVED_CARDS_FAILURE" }
  | { type: "INVALIDATE_TRANSACTIONS_CACHE" };

// Optional filter/page params for fetchTransactions; anything omitted
// falls back to "page 1, no filters".
export interface FetchTransactionsParams {
  page?: number;
  size?: number;
  type?: string;
  start?: string;
  end?: string;
}

// Shape of the value WalletContext.Provider exposes to consumers.
export interface WalletContextType {
  balance: number;
  vNuban: string | null;
  provider: string | null;
  isLoading: boolean;
  transactions: WalletTransaction[];
  isLoadingTransactions: boolean;
  hasMoreTransactions: boolean;
  fetchTransactions: (params?: FetchTransactionsParams, forceRefresh?: boolean) => Promise<void>;
  savedCards: SavedCard[];
  isLoadingSavedCards: boolean;
  fetchSavedCards: () => Promise<void>;
  // Re-fetches just the balance/vNuban/provider — exposed so a completed
  // withdrawal can refresh the displayed balance without a full page reload.
  refetchBalance: () => Promise<void>;
  sendWithdrawOtp: (payload: SendActivityOtpPayload) => Promise<ActivityOtpResponse>;
  submitWithdrawal: (payload: WithdrawFundsPayload) => Promise<WithdrawFundsResponse>;
  fetchPaymentGatewayOptions: (modules: string, assetId: string) => Promise<PaymentGatewayConfigResponse>;
  fetchGatewaySavedCards: (customerId: string) => Promise<ThirdPartyCustomerCardsResponse>;
  initiateFundWallet: (payload: FundWalletPayload) => Promise<FundWalletResponse>;
  removeSavedCard: (cardId: string) => Promise<void>;
}

// Payload for POST /auth/customers/resend-otp — triggers an email containing
// a one-time verification code before a sensitive wallet action (a
// withdrawal) is allowed to proceed.
export interface SendActivityOtpPayload {
  email: string;
  subject: string;
  message: string;
}

// Response shape isn't confirmed server-side (only the request payload was
// specified) — kept loose/optional so unexpected fields don't break typing.
export interface ActivityOtpResponse {
  code?: number;
  status?: string;
  message?: string;
}

// Payload for POST /transactions/withdraw-funds — submitted once the
// customer has confirmed the withdrawal with the OTP sent via
// sendActivityOtp. `password` must be RSA-encrypted (see hooks/encryption.ts)
// before being sent, the same way the login flow encrypts it.
export interface WithdrawFundsPayload {
  email: string;
  resendOtp: boolean;
  signature: string;
  amount: number;
  password: string;
  currency: string;
  gateway: string;
  channel: string;
  source: string;
  type: string;
  redirect_url: string;
  token: string;
}

// Response shape isn't confirmed server-side — kept loose/optional for the
// same reason as ActivityOtpResponse.
export interface WithdrawFundsResponse {
  code?: number;
  status?: string;
  message?: string;
}
