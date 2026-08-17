import { createContext, useContext, useEffect, useReducer, useState } from "react";
import {
  getTransactions,
  type GetTransactionsParams,
} from "../api/transactionService";
import type {
  Transaction,
  TransactionAction,
  TransactionContextType,
  TransactionDateRange,
  TransactionState,
  TransactionsResponse,
} from "../models/transactionModel";

export type {
  Transaction,
  TransactionAction,
  TransactionContextType,
  TransactionDateRange,
  TransactionState,
  TransactionsResponse,
};

// Investment-related sources only — wallet funding/withdrawal movements have
// their own dedicated view on the Wallet page, so they're excluded by
// default. The source filter lets the user narrow this further (e.g. just
// "Save"), but never adds wallet back in.
// eslint-disable-next-line react-refresh/only-export-components
export const TRANSACTION_SOURCE_OPTIONS = [
  "planin",
  "savein",
  "tradein",
  "investin",
];

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  totalItems: 0,
  totalPages: 0,
  transactionsCache: {},
};

const transactionReducer = (
  state: TransactionState,
  action: TransactionAction,
): TransactionState => {
  switch (action.type) {
    case "FETCH_TRANSACTIONS_START":
      return { ...state, isLoading: true };
    case "FETCH_TRANSACTIONS_SUCCESS": {
      const cacheKey = action.payload.cacheKey;
      return {
        ...state,
        isLoading: false,
        transactions: action.payload.transactions,
        totalItems: action.payload.totalItems,
        totalPages: action.payload.totalPages,
        transactionsCache: cacheKey ? {
          ...(state.transactionsCache || {}),
          [cacheKey]: {
            transactions: action.payload.transactions,
            totalItems: action.payload.totalItems,
            totalPages: action.payload.totalPages,
          }
        } : state.transactionsCache,
      };
    }
    case "FETCH_TRANSACTIONS_FAILURE":
      return { ...state, isLoading: false };
    case "INVALIDATE_CACHE":
      return { ...state, transactionsCache: {} };
    default:
      return state;
  }
};

const TransactionContexts = createContext<TransactionContextType | undefined>(
  undefined,
);

// Shared across any feature that needs the customer's transaction history
// (Overview's "Recent Transactions" teaser, the Transactions feature's
// all/incoming/outgoing tabs) so they hit the same endpoint through one
// context instead of each maintaining their own fetch/state logic.
export default function TransactionFeatures({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const [dateRange, setDateRange] = useState<TransactionDateRange>({
    start: "",
    end: "",
  });
  const [sourceFilter, setSourceFilter] = useState<string[]>(
    TRANSACTION_SOURCE_OPTIONS,
  );
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Exposed so any consumer can (re)fetch with whatever page/filters it
  // needs — e.g. Overview always wants page 1 of 5 unfiltered, while the
  // Transactions feature's tabs filter by type/source and paginate further.
  const fetchTransactions = async (params: GetTransactionsParams, forceRefresh = false) => {
    const size = params.size ?? 10;
    const page = params.page ?? 1;
    const type = params.type ?? "";
    const start = params.start ?? "";
    const end = params.end ?? "";
    const source = params.source ?? "";
    const channel = params.channel ?? "";
    const status = params.status ?? "";

    const cacheKey = JSON.stringify({ size, page, type, start, end, source, channel, status });

    if (!forceRefresh && state.transactionsCache?.[cacheKey]) {
      dispatch({ 
        type: "FETCH_TRANSACTIONS_SUCCESS", 
        payload: {
          transactions: state.transactionsCache[cacheKey].transactions,
          totalItems: state.transactionsCache[cacheKey].totalItems,
          totalPages: state.transactionsCache[cacheKey].totalPages,
          currentPage: page,
        },
      });
      return;
    }

    dispatch({ type: "FETCH_TRANSACTIONS_START" });
    try {
      const response = await getTransactions(params);
      dispatch({
        type: "FETCH_TRANSACTIONS_SUCCESS",
        payload: {
          transactions: response.data,
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          cacheKey
        },
      });
    } catch {
      dispatch({ type: "FETCH_TRANSACTIONS_FAILURE" });
    }
  };

  // Fetch the first page (unfiltered) once on mount, so Overview's teaser
  // has data immediately without every consumer needing to remember to
  // call fetchTransactions themselves.
  useEffect(() => {
    fetchTransactions({ page: 1, size: 5 });
  }, []);

  return (
    <TransactionContexts.Provider
      value={{
        transactions: state.transactions,
        isLoading: state.isLoading,
        totalItems: state.totalItems,
        totalPages: state.totalPages,
        fetchTransactions,
        dateRange,
        setDateRange,
        sourceFilter,
        setSourceFilter,
        statusFilter,
        setStatusFilter,
      }}
    >
      {children}
    </TransactionContexts.Provider>
  );
}

// Hook for consuming the transaction context; throws if used outside the
// TransactionFeatures provider so misuse fails loudly instead of returning
// undefined silently.
// eslint-disable-next-line react-refresh/only-export-components
export function useTransactionFeatures() {
  const context = useContext(TransactionContexts);

  if (context === undefined) {
    throw new Error(
      "useTransactionFeatures must be used within a TransactionFeatures provider",
    );
  }

  return context;
}
