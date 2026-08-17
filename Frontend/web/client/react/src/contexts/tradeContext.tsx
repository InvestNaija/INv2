import { createContext, useContext, useReducer, type ReactNode } from "react";
import {
  getRecommendedSecurities,
  getSecurities,
  getSecuritiesPerformance,
  getSecurityOverview,
  getTradePortfolios,
  getPortfolioById,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  calculateTradeOrderPrice,
  createTradeOrder,
  getOrderTerms,
  withdrawFromCashAccount,
  getTradeOrderHistory,
  cancelTradeOrder,
  fundTradeAccount,
} from "../api/tradeService";
import type {
  OrderTerm,
  TradeOrderPriceCalculation,
} from "../models/tradeModel";

export interface TradeState {
  isCalculatingPrice: boolean;
  isCreatingOrder: boolean;
  isFetchingOrderTerms: boolean;
  error: string | null;
  securitiesCache: any | null;
  recommendedSecuritiesCache: any | null;
  tradePortfoliosCache: any | null;
  watchlistCache: any | null;
  securitiesPerformanceCache: Record<string, any>;
}

export type TradeAction =
  | { type: "CALCULATE_PRICE_START" }
  | { type: "CALCULATE_PRICE_SUCCESS" }
  | { type: "CALCULATE_PRICE_FAILURE"; payload: string }
  | { type: "CREATE_ORDER_START" }
  | { type: "CREATE_ORDER_SUCCESS" }
  | { type: "CREATE_ORDER_FAILURE"; payload: string }
  | { type: "FETCH_TERMS_START" }
  | { type: "FETCH_TERMS_SUCCESS" }
  | { type: "FETCH_TERMS_FAILURE"; payload: string }
  | { type: "SET_CACHE"; key: keyof TradeState; payload: any }
  | { type: "INVALIDATE_CACHE" };

export interface TradeContextType extends TradeState {
  calculateOrderPrice: (payload: any) => Promise<TradeOrderPriceCalculation>;
  submitTradeOrder: (payload: any) => Promise<any>;
  fetchOrderTerms: () => Promise<any>;
  fetchRecommendedSecurities: (forceRefresh?: boolean) => Promise<any>;
  fetchSecurities: (forceRefresh?: boolean) => Promise<any>;
  fetchSecuritiesPerformance: (type: "pg" | "pl", forceRefresh?: boolean) => Promise<any>;
  fetchSecurityOverview: (secId: string) => Promise<any>;
  fetchTradePortfolios: (forceRefresh?: boolean) => Promise<any>;
  fetchPortfolioById: (id: string, signature: string) => Promise<any>;
  fetchWatchlist: (forceRefresh?: boolean) => Promise<any>;
  addWatchlist: (symbol: string) => Promise<void>;
  removeWatchlist: (symbol: string) => Promise<void>;
  withdrawCashAccount: (payload: any) => Promise<any>;
  fetchTradeOrderHistory: (params: any, signature: string) => Promise<any>;
  cancelOrder: (payload: any, signature: string) => Promise<any>;
  fundAccount: (payload: any, signature: string) => Promise<any>;
}

const initialState: TradeState = {
  isCalculatingPrice: false,
  isCreatingOrder: false,
  isFetchingOrderTerms: false,
  error: null,
  securitiesCache: null,
  recommendedSecuritiesCache: null,
  tradePortfoliosCache: null,
  watchlistCache: null,
  securitiesPerformanceCache: {},
};

const tradeReducer = (state: TradeState, action: TradeAction): TradeState => {
  switch (action.type) {
    case "CALCULATE_PRICE_START":
      return { ...state, isCalculatingPrice: true, error: null };
    case "CALCULATE_PRICE_SUCCESS":
      return { ...state, isCalculatingPrice: false, error: null };
    case "CALCULATE_PRICE_FAILURE":
      return { ...state, isCalculatingPrice: false, error: action.payload };

    case "CREATE_ORDER_START":
      return { ...state, isCreatingOrder: true, error: null };
    case "CREATE_ORDER_SUCCESS":
      return { ...state, isCreatingOrder: false, error: null };
    case "CREATE_ORDER_FAILURE":
      return { ...state, isCreatingOrder: false, error: action.payload };

    case "FETCH_TERMS_START":
      return { ...state, isFetchingOrderTerms: true, error: null };
    case "FETCH_TERMS_SUCCESS":
      return { ...state, isFetchingOrderTerms: false, error: null };
    case "FETCH_TERMS_FAILURE":
      return { ...state, isFetchingOrderTerms: false, error: action.payload };

    case "SET_CACHE":
      return { ...state, [action.key]: action.payload };

    case "INVALIDATE_CACHE":
      return {
        ...state,
        securitiesCache: null,
        recommendedSecuritiesCache: null,
        tradePortfoliosCache: null,
        watchlistCache: null,
        securitiesPerformanceCache: {},
      };

    default:
      return state;
  }
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(tradeReducer, initialState);

  const calculateOrderPrice = async (payload: any) => {
    dispatch({ type: "CALCULATE_PRICE_START" });
    try {
      const response = await calculateTradeOrderPrice(payload);
      dispatch({ type: "CALCULATE_PRICE_SUCCESS" });
      return response.data;
    } catch (error: any) {
      dispatch({
        type: "CALCULATE_PRICE_FAILURE",
        payload: error?.response?.data?.message || "Failed to calculate price",
      });
      throw error;
    }
  };

  const submitTradeOrder = async (payload: any) => {
    dispatch({ type: "CREATE_ORDER_START" });
    try {
      const response = await createTradeOrder(payload);
      dispatch({ type: "CREATE_ORDER_SUCCESS" });
      dispatch({ type: "INVALIDATE_CACHE" });
      return response.data;
    } catch (error: any) {
      dispatch({
        type: "CREATE_ORDER_FAILURE",
        payload: error?.response?.data?.message || "Failed to create order",
      });
      throw error;
    }
  };

  const fetchOrderTerms = async () => {
    dispatch({ type: "FETCH_TERMS_START" });
    try {
      const response = await getOrderTerms();
      dispatch({ type: "FETCH_TERMS_SUCCESS" });
      return response.data;
    } catch (error: any) {
      dispatch({
        type: "FETCH_TERMS_FAILURE",
        payload: error?.response?.data?.message || "Failed to fetch order terms",
      });
      throw error;
    }
  };

  const fetchRecommendedSecurities = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.recommendedSecuritiesCache) {
        return state.recommendedSecuritiesCache;
      }
      const response = await getRecommendedSecurities();
      dispatch({ type: "SET_CACHE", key: "recommendedSecuritiesCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchSecurities = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.securitiesCache) {
        return state.securitiesCache;
      }
      const response = await getSecurities();
      dispatch({ type: "SET_CACHE", key: "securitiesCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchSecuritiesPerformance = async (type: "pg" | "pl", forceRefresh = false) => {
    try {
      if (!forceRefresh && state.securitiesPerformanceCache?.[type]) {
        return state.securitiesPerformanceCache[type];
      }
      const response = await getSecuritiesPerformance(type);
      dispatch({ 
        type: "SET_CACHE", 
        key: "securitiesPerformanceCache", 
        payload: {
          ...(state.securitiesPerformanceCache || {}),
          [type]: response
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchSecurityOverview = async (secId: string) => {
    try {
      return await getSecurityOverview(secId);
    } catch (error) {
      throw error;
    }
  };

  const fetchTradePortfolios = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.tradePortfoliosCache) {
        return state.tradePortfoliosCache;
      }
      const response = await getTradePortfolios();
      dispatch({ type: "SET_CACHE", key: "tradePortfoliosCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchPortfolioById = async (id: string, signature: string) => {
    try {
      return await getPortfolioById(id, signature);
    } catch (error) {
      throw error;
    }
  };

  const fetchWatchlist = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.watchlistCache) {
        return state.watchlistCache;
      }
      const response = await getWatchlist();
      dispatch({ type: "SET_CACHE", key: "watchlistCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const addWatchlist = async (symbol: string) => {
    try {
      const response = await addToWatchlist(symbol);
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const removeWatchlist = async (symbol: string) => {
    try {
      const response = await removeFromWatchlist(symbol);
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const withdrawCashAccount = async (payload: any) => {
    try {
      const response = await withdrawFromCashAccount(payload);
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchTradeOrderHistory = async (params: any, signature: string) => {
    try {
      return await getTradeOrderHistory(params, signature);
    } catch (error) {
      throw error;
    }
  };

  const cancelOrder = async (payload: any, signature: string) => {
    try {
      const response = await cancelTradeOrder(payload, signature);
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fundAccount = async (payload: any, signature: string) => {
    try {
      const response = await fundTradeAccount(payload, signature);
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <TradeContext.Provider
      value={{
        ...state,
        calculateOrderPrice,
        submitTradeOrder,
        fetchOrderTerms,
        fetchRecommendedSecurities,
        fetchSecurities,
        fetchSecuritiesPerformance,
        fetchSecurityOverview,
        fetchTradePortfolios,
        fetchPortfolioById,
        fetchWatchlist,
        addWatchlist,
        removeWatchlist,
        withdrawCashAccount,
        fetchTradeOrderHistory,
        cancelOrder,
        fundAccount,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error("useTrade must be used within a TradeProvider");
  }
  return context;
};
