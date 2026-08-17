import axios from "axios";
import type {
  PortfoliosResponse,
  InvestmentPortfolioDetailResponse,
} from "../models/portfolioModel";
import type {
  FundAssetsResponse,
  FundAssetDetailResponse,
  FundAssetBalanceResponse,
} from "../models/fundAssetModel";
import type { IPOOfferingsResponse } from "../models/ipoModel";

const baseUrl = import.meta.env.VITE_BASE_URL;
const fundBaseUrl = import.meta.env.VITE_FUND_BASE_URL;

// ── Portfolio methods ────────────────────────────────────────────────

// Fetches the user's investment (mutual funds/assets) portfolios, for the
// balance card on the Investments dashboard. Same response shape as
// GET /trades/portfolios (sibling endpoint on the same backend).
const getInvestmentPortfolios = async (): Promise<PortfoliosResponse> => {
  const response = await axios.get<PortfoliosResponse>(
    `${baseUrl}/investin/portfolios`,
  );
  return response.data;
};

// Fetches live detail (balances, holdings) for a single investment
// portfolio — the Investments-side sibling of trades' getPortfolioById,
// called whenever the selected portfolio changes so the balance card and
// "My Holdings" list reflect current figures rather than the list
// snapshot. `signature` is the currently-selected portfolio's own
// signature, sent as the `x-secure-token` header.
const getInvestmentPortfolioById = async (
  id: string,
  signature: string,
): Promise<InvestmentPortfolioDetailResponse> => {
  const response = await axios.get<InvestmentPortfolioDetailResponse>(
    `${baseUrl}/investin/portfolio-balance/${id}`,
    { headers: { "x-secure-token": signature } },
  );
  return response.data;
};

// ── Fund / Bond / IPO asset methods ─────────────────────────────────

/**
 * Fetches all FUND-type assets from the CHD funds service.
 * The response contains a single entry whose `Assets` array holds every
 * mutual fund (both NGN and USD denominated).
 */
const getFundAssets = async (): Promise<FundAssetsResponse> => {
  const response = await axios.get<FundAssetsResponse>(
    `${fundBaseUrl}/get-assets`,
    { params: { t: "FUND" } },
  );
  return response.data;
};

/**
 * Fetches all BOND-type assets from the CHD funds service.
 * Same response shape as getFundAssets — only the `t` param differs.
 */
const getBondAssets = async (): Promise<FundAssetsResponse> => {
  const response = await axios.get<FundAssetsResponse>(
    `${fundBaseUrl}/get-assets`,
    { params: { t: "BOND" } },
  );
  return response.data;
};

/**
 * Fetches all OTHERS-type assets from the CHD funds service.
 */
const getOtherAssets = async (): Promise<FundAssetsResponse> => {
  const response = await axios.get<FundAssetsResponse>(
    `${fundBaseUrl}/get-assets`,
    { params: { t: "OTHERS" } },
  );
  return response.data;
};

/**
 * Fetches IPO / primary-offer listings from the main backend.
 * Requires auth — the axios interceptor should attach the token automatically.
 */
const getIPOOfferings = async (): Promise<IPOOfferingsResponse> => {
  const response = await axios.get<IPOOfferingsResponse>(
    `${baseUrl}/3rd-party-services/po/offerings`,
  );
  return response.data;
};

/**
 * Fetches details for a specific asset by ID and the user's BVN.
 */
const getFundAssetDetails = async (
  id: string,
  bvn: string,
  productType?: string
): Promise<any> => {
  if (productType) {
    const response = await axios.get<any>(
      `${baseUrl}/3rd-party-services/po/offerings/${id}?type=${productType.toLowerCase()}`
    );
    return response.data;
  }
  const response = await axios.get<FundAssetDetailResponse>(
    `${fundBaseUrl}/get-assets/${id}?bvn=${bvn}`
  );
  return response.data;
};

/**
 * Fetches the user's holding/balance for a specific fund.
 */
const getFundAssetBalance = async (
  bvn: string,
  name: string,
  portfolio_id: string,
  signature: string,
): Promise<FundAssetBalanceResponse> => {
  const today = new Date().toISOString().split("T")[0];
  const response = await axios.get<FundAssetBalanceResponse>(
    `${fundBaseUrl}/get-asset-balance`,
    {
      params: {
        bvn,
        name,
        portfolio_id,
        sd: today,
        ed: today,
      },
      headers: {
        "x-secure-token": signature,
      },
    },
  );
  return response.data;
};

export interface FundSubscriptionPayload {
  paymentMethod: string;
  gateway: string;
  id: string;
  asset_quantity: number;
  transAmount: number;
  description: string;
  type: string;
  asset_type: string;
  fundName: string;
  orderBase: string;
  transType: string;
  portfolioId: string;
  portfolioName: string;
  redirect_url: string;
  currency: string;
  assetName: string;
  post_url: string;
  callback_params: {
    module: string;
    resident: boolean;
    tenor: string;
    asset_id: string;
    gateway_id?: string;
    saveCard: boolean;
    brokerageInfo: Record<string, any>;
  };
  gatewayEndpoints: string;
  gateway_id?: string;
  channel?: string;
  channels?: string[];
}

export interface FundSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    authorization_url?: string;
    [key: string]: any;
  };
}

/**
 * Submits a subscription order to buy a fund.
 */
const subscribeToFund = async (
  payload: FundSubscriptionPayload | FormData,
  signature: string
): Promise<FundSubscriptionResponse> => {
  const response = await axios.post<FundSubscriptionResponse>(
    `${baseUrl}/investin/funds/subscription`,
    payload,
    {
      headers: {
        "x-secure-token": signature,
      },
    }
  );
  return response.data;
};

const initiatePayment = async (
  payload: FundSubscriptionPayload | FormData,
  signature: string
): Promise<FundSubscriptionResponse> => {
  const response = await axios.post<FundSubscriptionResponse>(
    `${baseUrl}/3rd-party-services/payment/initiate`,
    payload,
    {
      headers: {
        "x-secure-token": signature,
      },
    }
  );
  return response.data;
};

export interface FundRedemptionPayload {
  token: string;
  email: string;
  redemptionType: "partial" | "full";
  assetId: string;
  transAmount: number;
  cashAccountControlId: number;
  transType: "REDEMPTION";
  description: string;
  currency: string;
  transUnits: number;
  orderBase: "QUANTITY" | "VALUE";
  portfolioName: string;
  fundName: string;
  portfolioId: string;
}

export interface FundRedemptionUpdatePayload {
  newAmount: number;
  newUnits: number;
  assetId: string | number;
  description: string;
  token: string;
  email: string;
  transactionId: string;
}

export interface FundRedemptionResponse {
  success: boolean;
  message: string;
  data: any;
}

/**
 * Submits a redemption order to sell a fund.
 */
const redeemFund = async (
  payload: FundRedemptionPayload,
  signature: string
): Promise<FundRedemptionResponse> => {
  const response = await axios.post<FundRedemptionResponse>(
    `${baseUrl}/investin/funds/redemption`,
    payload,
    {
      headers: {
        "x-secure-token": signature,
      },
    }
  );
  return response.data;
};

/**
 * Submits an edit order for an existing pending redemption.
 */
const editRedemptionFund = async (
  transactionId: string,
  payload: FundRedemptionUpdatePayload,
  signature: string
): Promise<FundRedemptionResponse> => {
  const response = await axios.post<FundRedemptionResponse>(
    `${baseUrl}/transactions/edit-redemption/${transactionId}`,
    payload,
    {
      headers: {
        "x-secure-token": signature,
      },
    }
  );
  return response.data;
};

/**
 * Fetches pending transactions for a given asset.
 */
const getPendingTransactions = async (
  assetId: string,
  fundName: string,
  transType: string,
  signature: string
): Promise<any> => {
  const response = await axios.get(
    `${baseUrl}/transactions/get-pending-transactions/${assetId}`,
    {
      params: { fundName, transType },
      headers: {
        "x-secure-token": signature,
      },
    }
  );
  return response.data;
};

export {
  getInvestmentPortfolios,
  getInvestmentPortfolioById,
  getFundAssets,
  getBondAssets,
  getIPOOfferings,
  getFundAssetDetails,
  getFundAssetBalance,
  getOtherAssets,
  subscribeToFund,
  initiatePayment,
  redeemFund,
  editRedemptionFund,
  getPendingTransactions,
};

import type { FundTransactionResponse } from "../models/fundAssetModel";

export const getFundTransactionHistory = async (
  portfolioId: string,
  signature: string,
  fundId: number,
  fundName: string,
  page: number = 1,
  size: number = 10,
  startDate: string = "",
  endDate: string = "",
  status: string = ""
): Promise<FundTransactionResponse> => {
  const url = `${baseUrl}/investin/funds/history?portfolioId=${portfolioId}&fundId=${fundId}&fundName=${fundName}&page=${page}&size=${size}&startDate=${startDate}&endDate=${endDate}&status=${status}`;
  const response = await axios.get<FundTransactionResponse>(url, {
    headers: {
      "x-secure-token": signature,
    },
  });
  return response.data;
};
