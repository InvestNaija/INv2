import { createContext, useContext, useReducer, type ReactNode } from "react";
import {
  initiatePayment,
  subscribeToFund,
  getFundAssets,
  getInvestmentPortfolios,
  getInvestmentPortfolioById,
  getBondAssets,
  getIPOOfferings,
  getFundAssetDetails,
  getFundAssetBalance,
  getOtherAssets,
  redeemFund,
  editRedemptionFund,
  getPendingTransactions,
  getFundTransactionHistory,
} from "../api/investmentService";

export interface InvestmentState {
  isSubscribing: boolean;
  isInitiatingPayment: boolean;
  error: string | null;
  fundAssetsCache: any | null;
  investmentPortfoliosCache: any | null;
  bondAssetsCache: any | null;
  ipoOfferingsCache: any | null;
  otherAssetsCache: any | null;
  portfolioBalanceCache: Record<string, any>;
}

export type InvestmentAction =
  | { type: "SUBSCRIBE_START" }
  | { type: "SUBSCRIBE_SUCCESS" }
  | { type: "SUBSCRIBE_FAILURE"; payload: string }
  | { type: "INITIATE_PAYMENT_START" }
  | { type: "INITIATE_PAYMENT_SUCCESS" }
  | { type: "INITIATE_PAYMENT_FAILURE"; payload: string }
  | { type: "SET_CACHE"; key: keyof InvestmentState; payload: any }
  | { type: "SET_PORTFOLIO_BALANCE_CACHE"; id: string; payload: any }
  | { type: "INVALIDATE_CACHE" };

export interface InvestmentContextType extends InvestmentState {
  subscribeFund: (payload: any, signature: string) => Promise<any>;
  initPayment: (payload: any, signature: string) => Promise<any>;
  fetchFundAssets: (forceRefresh?: boolean) => Promise<any>;
  fetchInvestmentPortfolios: (forceRefresh?: boolean) => Promise<any>;
  fetchInvestmentPortfolioById: (id: string, signature: string, forceRefresh?: boolean) => Promise<any>;
  fetchBondAssets: (forceRefresh?: boolean) => Promise<any>;
  fetchIPOOfferings: (forceRefresh?: boolean) => Promise<any>;
  fetchFundAssetDetails: (id: string, bvn: string, productType?: string) => Promise<any>;
  fetchFundAssetBalance: (bvn: string, name: string, portfolio_id: string, signature: string) => Promise<any>;
  fetchOtherAssets: (forceRefresh?: boolean) => Promise<any>;
  redeemInvestment: (payload: any, signature: string) => Promise<any>;
  editRedemption: (transactionId: string, payload: any, signature: string) => Promise<any>;
  fetchPendingTransactions: (assetId: string, fundName: string, transType: string, signature: string) => Promise<any>;
  fetchFundTransactionHistory: (portfolioId: string, signature: string, fundId: number, fundName: string, page?: number, size?: number, startDate?: string, endDate?: string, status?: string) => Promise<any>;
}

const initialState: InvestmentState = {
  isSubscribing: false,
  isInitiatingPayment: false,
  error: null,
  fundAssetsCache: null,
  investmentPortfoliosCache: null,
  bondAssetsCache: null,
  ipoOfferingsCache: null,
  otherAssetsCache: null,
  portfolioBalanceCache: {},
};

const investmentReducer = (state: InvestmentState, action: InvestmentAction): InvestmentState => {
  switch (action.type) {
    case "SUBSCRIBE_START":
      return { ...state, isSubscribing: true, error: null };
    case "SUBSCRIBE_SUCCESS":
      return { ...state, isSubscribing: false, error: null };
    case "SUBSCRIBE_FAILURE":
      return { ...state, isSubscribing: false, error: action.payload };

    case "INITIATE_PAYMENT_START":
      return { ...state, isInitiatingPayment: true, error: null };
    case "INITIATE_PAYMENT_SUCCESS":
      return { ...state, isInitiatingPayment: false, error: null };
    case "INITIATE_PAYMENT_FAILURE":
      return { ...state, isInitiatingPayment: false, error: action.payload };

    case "SET_CACHE":
      return { ...state, [action.key]: action.payload };
    case "SET_PORTFOLIO_BALANCE_CACHE":
      return { 
        ...state, 
        portfolioBalanceCache: {
          ...(state.portfolioBalanceCache || {}),
          [action.id]: action.payload
        }
      };
    case "INVALIDATE_CACHE":
      return {
        ...state,
        fundAssetsCache: null,
        investmentPortfoliosCache: null,
        bondAssetsCache: null,
        ipoOfferingsCache: null,
        otherAssetsCache: null,
        portfolioBalanceCache: {},
      };

    default:
      return state;
  }
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(investmentReducer, initialState);

  const subscribeFund = async (payload: any, signature: string) => {
    dispatch({ type: "SUBSCRIBE_START" });
    try {
      const response = await subscribeToFund(payload, signature);
      dispatch({ type: "SUBSCRIBE_SUCCESS" });
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error: any) {
      dispatch({
        type: "SUBSCRIBE_FAILURE",
        payload: error?.response?.data?.message || "Failed to subscribe to fund",
      });
      throw error;
    }
  };

  const initPayment = async (payload: any, signature: string) => {
    dispatch({ type: "INITIATE_PAYMENT_START" });
    try {
      const response = await initiatePayment(payload, signature);
      dispatch({ type: "INITIATE_PAYMENT_SUCCESS" });
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error: any) {
      dispatch({
        type: "INITIATE_PAYMENT_FAILURE",
        payload: error?.response?.data?.message || "Failed to initiate payment",
      });
      throw error;
    }
  };

  const fetchFundAssets = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.fundAssetsCache) {
        return state.fundAssetsCache;
      }
      const response = await getFundAssets();
      dispatch({ type: "SET_CACHE", key: "fundAssetsCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchInvestmentPortfolios = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.investmentPortfoliosCache) {
        return state.investmentPortfoliosCache;
      }
      const response = await getInvestmentPortfolios();
      dispatch({ type: "SET_CACHE", key: "investmentPortfoliosCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchInvestmentPortfolioById = async (id: string, signature: string, forceRefresh = false) => {
    try {
      if (!forceRefresh && state.portfolioBalanceCache?.[id]) {
        return state.portfolioBalanceCache[id];
      }
      const response = await getInvestmentPortfolioById(id, signature);
      dispatch({ type: "SET_PORTFOLIO_BALANCE_CACHE", id, payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchBondAssets = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.bondAssetsCache) {
        return state.bondAssetsCache;
      }
      const response = await getBondAssets();
      dispatch({ type: "SET_CACHE", key: "bondAssetsCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchIPOOfferings = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.ipoOfferingsCache) {
        return state.ipoOfferingsCache;
      }
      const response = await getIPOOfferings();
      dispatch({ type: "SET_CACHE", key: "ipoOfferingsCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchFundAssetDetails = async (id: string, bvn: string, productType?: string) => {
    try {
      return await getFundAssetDetails(id, bvn, productType);
    } catch (error) {
      throw error;
    }
  };

  const fetchFundAssetBalance = async (bvn: string, name: string, portfolio_id: string, signature: string) => {
    try {
      return await getFundAssetBalance(bvn, name, portfolio_id, signature);
    } catch (error) {
      throw error;
    }
  };

  const fetchOtherAssets = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && state.otherAssetsCache) {
        return state.otherAssetsCache;
      }
      const response = await getOtherAssets();
      dispatch({ type: "SET_CACHE", key: "otherAssetsCache", payload: response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const redeemInvestment = async (payload: any, signature: string) => {
    try {
      const response = await redeemFund(payload, signature);
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const editRedemption = async (transactionId: string, payload: any, signature: string) => {
    try {
      const response = await editRedemptionFund(transactionId, payload, signature);
      dispatch({ type: "INVALIDATE_CACHE" });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchPendingTransactions = async (assetId: string, fundName: string, transType: string, signature: string) => {
    try {
      return await getPendingTransactions(assetId, fundName, transType, signature);
    } catch (error) {
      throw error;
    }
  };

  const fetchFundTransactionHistory = async (portfolioId: string, signature: string, fundId: number, fundName: string, page?: number, size?: number, startDate?: string, endDate?: string, status?: string) => {
    try {
      return await getFundTransactionHistory(portfolioId, signature, fundId, fundName, page, size, startDate, endDate, status);
    } catch (error) {
      throw error;
    }
  };

  return (
    <InvestmentContext.Provider
      value={{
        ...state,
        subscribeFund,
        initPayment,
        fetchFundAssets,
        fetchInvestmentPortfolios,
        fetchInvestmentPortfolioById,
        fetchBondAssets,
        fetchIPOOfferings,
        fetchFundAssetDetails,
        fetchFundAssetBalance,
        fetchOtherAssets,
        redeemInvestment,
        editRedemption,
        fetchPendingTransactions,
        fetchFundTransactionHistory,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestment must be used within a InvestmentProvider");
  }
  return context;
};
