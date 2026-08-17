// Params accepted by GET /transactions/my-transactions.
export interface GetTransactionsParams {
  page: number;
  size: number;
  channel?: string;
  source?: string;
  type?: string;
  start?: string;
  end?: string;
  // Comma-separated, following the same multi-value convention as `source`
  // (e.g. "success,pending"). Not confirmed server-side, so callers should
  // also filter the returned page client-side as a safety net.
  status?: string;
}

// A date range applied to the transaction list ("" on either side means
// unset). Kept here rather than in each list component so the Transactions
// feature's filter header (which lives in a different part of the route
// tree to the All/Incoming/Outgoing tab content) and the list itself stay
// in sync.
export interface TransactionDateRange {
  start: string;
  end: string;
}

// One entry in the customer's transaction history. The real API response
// carries a lot more (gateway_response, signature, transaction_invest,
// etc.) — only the fields actually rendered anywhere are modeled here.
export interface Transaction {
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

// Full shape of GET /transactions/my-transactions.
export interface TransactionsResponse {
  code: number;
  status: string;
  message: string;
  data: Transaction[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// State shape backing TransactionContext (see contexts/transactionContext.tsx).
export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  totalItems: number;
  totalPages: number;
  transactionsCache: Record<string, { transactions: Transaction[]; totalItems: number; totalPages: number }>;
}

// Actions handled by transactionContext's reducer.
export type TransactionAction =
  | { type: "FETCH_TRANSACTIONS_START" }
  | {
      type: "FETCH_TRANSACTIONS_SUCCESS";
      payload: { transactions: Transaction[]; totalItems: number; totalPages: number; cacheKey?: string };
    }
  | { type: "FETCH_TRANSACTIONS_FAILURE" }
  | { type: "INVALIDATE_CACHE" };

// Shape of the value TransactionContext.Provider exposes to consumers.
export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  totalItems: number;
  totalPages: number;
  fetchTransactions: (params: GetTransactionsParams) => Promise<void>;
  // Shared filter UI state — set by the Transactions feature's header
  // (source/status dropdowns, date-period dialog) and read by
  // TransactionsList to build its fetch params, since the two live in
  // different parts of the route tree but need to stay in sync.
  dateRange: TransactionDateRange;
  setDateRange: (range: TransactionDateRange) => void;
  // Multi-select — which of the investment sources to include.
  sourceFilter: string[];
  setSourceFilter: (sources: string[]) => void;
  // Single-select — "" means all statuses.
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}
