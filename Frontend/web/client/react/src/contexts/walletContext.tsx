import { createContext, useContext, useEffect, useReducer } from "react";
import { useAuth } from "./authContext";
import {
  getSavedCards,
  getWalletBalance,
  getWalletTransactions,
  sendActivityOtp,
  withdrawFunds,
  getPaymentGatewayOptions,
  getGatewaySavedCards,
  fundWallet,
  deleteSavedCard,
} from "../api/walletService";
import type {
  ActivityOtpResponse,
  CardDetails,
  CustomerCardsResponse,
  FetchTransactionsParams,
  SavedCard,
  SavePlanCalculatorType,
  SavePlanUser,
  SendActivityOtpPayload,
  VirtualAccount,
  WalletAction,
  WalletBalanceResponse,
  WalletContextType,
  WalletPlan,
  WalletState,
  WalletTransaction,
  WalletTransactionsResponse,
  WithdrawFundsPayload,
  WithdrawFundsResponse,
  ThirdPartyCustomerCardsResponse,
  PaymentGatewayConfigResponse,
  FundWalletPayload,
  FundWalletResponse,
} from "../models/walletModel";

export type {
  ActivityOtpResponse,
  CardDetails,
  CustomerCardsResponse,
  FetchTransactionsParams,
  SavedCard,
  SavePlanCalculatorType,
  SavePlanUser,
  SendActivityOtpPayload,
  VirtualAccount,
  WalletAction,
  WalletBalanceResponse,
  WalletContextType,
  WalletPlan,
  WalletState,
  WalletTransaction,
  WalletTransactionsResponse,
  WithdrawFundsPayload,
  WithdrawFundsPayload,
  WithdrawFundsResponse,
};

type WalletAction =
  | { type: "FETCH_WALLET_BALANCE_START" }
  | { type: "FETCH_WALLET_BALANCE_SUCCESS"; payload: { balance: number; vNuban: string | null; provider: string | null } }
  | { type: "FETCH_WALLET_BALANCE_FAILURE" }
  | { type: "FETCH_WALLET_TRANSACTIONS_START" }
  | { type: "FETCH_WALLET_TRANSACTIONS_SUCCESS"; payload: { transactions: WalletTransaction[]; hasMore: boolean; cacheKey?: string } }
  | { type: "FETCH_WALLET_TRANSACTIONS_FAILURE" }
  | { type: "INVALIDATE_TRANSACTIONS_CACHE" }
  | { type: "FETCH_SAVED_CARDS_START" }
  | { type: "FETCH_SAVED_CARDS_SUCCESS"; payload: SavedCard[] }
  | { type: "FETCH_SAVED_CARDS_FAILURE" };

const initialState: WalletState = {
  balance: 0,
  vNuban: null,
  provider: null,
  isLoading: false,
  savedCards: [],
  isLoadingSavedCards: false,
  transactions: [],
  isLoadingTransactions: false,
  hasMoreTransactions: false,
  transactionsCache: {},
  cardsCache: null,
};

// START flips isLoading, SUCCESS stores the fetched balance/account details,
// FAILURE just clears isLoading (balance/vNuban/provider are left as-is, so
// a failed refresh doesn't wipe out the last known-good values).
const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case "FETCH_WALLET_BALANCE_START":
      return { ...state, isLoading: true };
    case "FETCH_WALLET_BALANCE_SUCCESS":
      return {
        ...state,
        isLoading: false,
        balance: action.payload.balance,
        vNuban: action.payload.vNuban,
        provider: action.payload.provider,
      };
    case "FETCH_WALLET_BALANCE_FAILURE":
      return { ...state, isLoading: false };

    case "FETCH_WALLET_TRANSACTIONS_START":
      return { ...state, isLoadingTransactions: true };
    case "FETCH_WALLET_TRANSACTIONS_SUCCESS": {
      const cacheKey = action.payload.cacheKey;
      return {
        ...state,
        isLoadingTransactions: false,
        transactions: action.payload.transactions,
        hasMoreTransactions: action.payload.hasMore,
        transactionsCache: cacheKey ? {
          ...(state.transactionsCache || {}),
          [cacheKey]: {
            transactions: action.payload.transactions,
            hasMore: action.payload.hasMore,
          }
        } : state.transactionsCache,
      };
    }
    case "FETCH_WALLET_TRANSACTIONS_FAILURE":
      return { ...state, isLoadingTransactions: false };
      
    case "INVALIDATE_TRANSACTIONS_CACHE":
      return { ...state, transactionsCache: {} };

    case "FETCH_SAVED_CARDS_START":
      return { ...state, isLoadingSavedCards: true };
    case "FETCH_SAVED_CARDS_SUCCESS":
      return { 
        ...state, 
        isLoadingSavedCards: false, 
        savedCards: action.payload,
        cardsCache: action.payload 
      };
    case "FETCH_SAVED_CARDS_FAILURE":
      return { ...state, isLoadingSavedCards: false };
    default:
      return state;
  }
};

const WalletContexts = createContext<WalletContextType | undefined>(undefined);

export default function WalletFeatures({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  // WalletFeatures sits above the router (so it survives navigation between
  // /auth and /app), which means it never unmounts on its own when one
  // customer logs out and a different one logs in — without this, the
  // mount-only fetches below would just keep showing whoever was fetched
  // first. Keying off the token instead makes them refire on every distinct
  // login (a fresh token is issued each time), so switching accounts always
  // shows that account's own balance/transactions/cards.
  const { state: authState } = useAuth();
  const token = authState.token;

  // Fetches/re-fetches the wallet balance. The bank/provider name for the
  // funding account is nested three levels deep in the response (the first
  // save-plan user's first virtual account) — pulled out here so consumers
  // can use it directly instead of reaching into the raw response shape.
  // Named (not inline in the effect) so it can also be exposed as
  // `refetchBalance`, letting a completed withdrawal refresh the displayed
  // balance without a full page reload.
  const fetchWalletBalance = async () => {
    dispatch({ type: "FETCH_WALLET_BALANCE_START" });
    try {
      const response = await getWalletBalance();
      const provider =
        response.data?.saveplan_users?.[0]?.virtualAccounts?.[0]?.provider ?? null;
      dispatch({
        type: "FETCH_WALLET_BALANCE_SUCCESS",
        payload: { balance: response.balance, vNuban: response.vNuban, provider },
      });
    } catch {
      dispatch({ type: "FETCH_WALLET_BALANCE_FAILURE" });
    }
  };

  // Fetch the wallet balance on mount, and again on every distinct login
  // (see the `token` comment above) — not just once ever.
  useEffect(() => {
    if (!token) return;
    fetchWalletBalance();
  }, [token]);

  // Fetches a page of the transaction history, filtered/paginated per
  // `params`. Exposed so the Wallet page can call it again whenever the
  // user changes the page or the type filter, not just once on mount.
  const fetchTransactions = async (params: FetchTransactionsParams = {}, forceRefresh = false) => {
    const size = params.size ?? 5;
    const page = params.page ?? 1;
    const type = params.type ?? "";
    const start = params.start ?? "";
    const end = params.end ?? "";
    
    const cacheKey = JSON.stringify({ size, page, type, start, end });
    
    if (!forceRefresh && state.transactionsCache?.[cacheKey]) {
      dispatch({
        type: "FETCH_WALLET_TRANSACTIONS_SUCCESS",
        payload: { 
          transactions: state.transactionsCache[cacheKey].transactions, 
          hasMore: state.transactionsCache[cacheKey].hasMore,
        } as any,
      });
      return;
    }

    dispatch({ type: "FETCH_WALLET_TRANSACTIONS_START" });
    try {
      const response = await getWalletTransactions({ page, size, type, start, end });
      dispatch({
        type: "FETCH_WALLET_TRANSACTIONS_SUCCESS",
        payload: { 
          transactions: response.data, 
          hasMore: response.data.length === size,
          cacheKey
        } as any,
      });
    } catch {
      dispatch({ type: "FETCH_WALLET_TRANSACTIONS_FAILURE" });
    }
  };

  // Fetch the first page of transactions on mount and on every distinct
  // login, independently of the balance fetch above (a slow/failed
  // transactions call shouldn't block the balance from showing, and vice
  // versa).
  useEffect(() => {
    if (!token) return;
    fetchTransactions();
  }, [token]);

  const fetchSavedCards = async (forceRefresh = false) => {
    if (!forceRefresh && state.cardsCache) {
      dispatch({
        type: "FETCH_SAVED_CARDS_SUCCESS",
        payload: state.cardsCache,
      });
      return;
    }
    dispatch({ type: "FETCH_SAVED_CARDS_START" });
    try {
      const response = await getSavedCards();
      dispatch({
        type: "FETCH_SAVED_CARDS_SUCCESS",
        payload: response.data.cards,
      });
    } catch {
      dispatch({ type: "FETCH_SAVED_CARDS_FAILURE" });
    }
  };

  // Fetch the customer's saved cards on mount and on every distinct login,
  // for the "Saved cards" list — independent of the other fetches for the
  // same reason.
  useEffect(() => {
    if (!token) return;
    fetchSavedCards();
  }, [token]);

  // Thin passthroughs to the withdrawal endpoints — no reducer state of
  // their own since "is this in flight" is UI-local to whichever dialog
  // triggers it (not shared with any other consumer), but routed through
  // the context anyway so every wallet API call lives in one place, same as
  // balance/transactions/cards above.
  const sendWithdrawOtp = (payload: SendActivityOtpPayload): Promise<ActivityOtpResponse> =>
    sendActivityOtp(payload);

  const submitWithdrawal = async (payload: WithdrawFundsPayload): Promise<WithdrawFundsResponse> => {
    const response = await withdrawFunds(payload);
    dispatch({ type: "INVALIDATE_TRANSACTIONS_CACHE" });
    return response;
  }

  const fetchPaymentGatewayOptions = (modules: string, assetId: string): Promise<PaymentGatewayConfigResponse> =>
    getPaymentGatewayOptions(modules, assetId);

  const fetchGatewaySavedCards = (customerId: string): Promise<ThirdPartyCustomerCardsResponse> =>
    getGatewaySavedCards(customerId);

  const initiateFundWallet = async (payload: FundWalletPayload): Promise<FundWalletResponse> => {
    const response = await fundWallet(payload);
    dispatch({ type: "INVALIDATE_TRANSACTIONS_CACHE" });
    return response;
  }

  const removeSavedCard = (cardId: string): Promise<void> =>
    deleteSavedCard(cardId);

  return (
    <WalletContexts.Provider
      value={{
        balance: state.balance,
        vNuban: state.vNuban,
        provider: state.provider,
        isLoading: state.isLoading,
        transactions: state.transactions,
        isLoadingTransactions: state.isLoadingTransactions,
        hasMoreTransactions: state.hasMoreTransactions,
        fetchTransactions,
        savedCards: state.savedCards,
        isLoadingSavedCards: state.isLoadingSavedCards,
        fetchSavedCards,
        refetchBalance: fetchWalletBalance,
        sendWithdrawOtp,
        submitWithdrawal,
        fetchPaymentGatewayOptions,
        fetchGatewaySavedCards,
        initiateFundWallet,
        removeSavedCard,
      }}
    >
      {children}
    </WalletContexts.Provider>
  );
}

// Hook for consuming the wallet context; throws if used outside the
// WalletFeatures provider so misuse fails loudly instead of returning
// undefined silently.
// eslint-disable-next-line react-refresh/only-export-components
export function useWalletFeatures() {
  const context = useContext(WalletContexts);

  if (context === undefined) {
    throw new Error("useWalletFeatures must be used within a WalletFeatures provider");
  }

  return context;
}
