import axios from "axios";
import type {
  RecommendedSecuritiesResponse,
  SecuritiesListResponse,
  SecurityOverviewResponse,
  CalculateTradePricePayload,
  CalculateTradePriceResponse,
  CreateTradeOrderPayload,
  CreateTradeOrderResponse,
  OrderTermsResponse,
  CashAccountWithdrawPayload,
  CashAccountWithdrawResponse,
  TradeOrderHistoryParams,
  TradeOrderHistoryResponse,
  CancelTradeOrderPayload,
  CancelTradeOrderResponse,
  FundTradeAccountPayload,
  FundTradeAccountResponse,
} from "../models/tradeModel";
import type {
  PortfoliosResponse,
  PortfolioDetailResponse,
} from "../models/portfolioModel";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Fetches the platform's recommended securities for the "Recommended" tab
// on the Trade dashboard.
const getRecommendedSecurities = async (): Promise<RecommendedSecuritiesResponse> => {
  const response = await axios.get<RecommendedSecuritiesResponse>(
    `${baseUrl}/trades/securities/recommended`,
  );
  return response.data;
};

// Fetches every tradeable security for the "All" tab. Called without any
// query params — the whole list comes back in one response, and pagination
// and search are both done client-side over it instead.
const getSecurities = async (): Promise<SecuritiesListResponse> => {
  const response = await axios.get<SecuritiesListResponse>(
    `${baseUrl}/trades/securities`,
  );
  return response.data;
};

// Fetches the platform's top gainers ("pg") or top losers ("pl") for the
// Gainers/Losers tabs. No page/size sent — this is a curated top-N
// endpoint, not a paginated view, and any pagination/search happens
// client-side over whatever it returns.
const getSecuritiesPerformance = async (
  type: "pg" | "pl",
): Promise<SecuritiesListResponse> => {
  const response = await axios.get<SecuritiesListResponse>(
    `${baseUrl}/trades/securities/performance`,
    { params: { type } },
  );
  return response.data;
};

// Fetches full detail (price, chart, order book, recent trades) for a
// single security, keyed by its secId (e.g. "MTNN"), for the trade details
// page.
const getSecurityOverview = async (
  secId: string,
): Promise<SecurityOverviewResponse> => {
  const response = await axios.get<SecurityOverviewResponse>(
    `${baseUrl}/trades/security/overview/${secId}`,
  );
  return response.data;
};

// Fetches the user's trading portfolios (balance, cash, holdings), for the
// balance card on the Trade dashboard.
const getTradePortfolios = async (): Promise<PortfoliosResponse> => {
  const response = await axios.get<PortfoliosResponse>(
    `${baseUrl}/trades/portfolios`,
  );
  return response.data;
};

// Fetches live detail (balances, holdings) for a single trade portfolio —
// called whenever the selected portfolio changes so the balance card
// reflects current figures rather than the list snapshot. `signature` is
// the currently-selected portfolio's own signature, sent as the
// `x-secure-token` header (same pattern as order creation/withdrawal).
const getPortfolioById = async (
  id: string,
  signature: string,
): Promise<PortfolioDetailResponse> => {
  const response = await axios.get<PortfolioDetailResponse>(
    `${baseUrl}/trades/portfolios/${id}`,
    { headers: { "x-secure-token": signature } },
  );
  return response.data;
};

// Fetches the user's watched securities for the "Watchlist" tab on the
// Explore Securities section. Same response shape as
// /trades/securities/recommended.
const getWatchlist = async (): Promise<RecommendedSecuritiesResponse> => {
  const response = await axios.get<RecommendedSecuritiesResponse>(
    `${baseUrl}/trades/securities/watchlist`,
  );
  return response.data;
};

// Bookmarks a security to the user's watchlist (the bookmark/star icon on
// the trade details page).
const addToWatchlist = async (symbol: string): Promise<void> => {
  await axios.post(`${baseUrl}/trades/securities/watchlist`, { symbol });
};

// Removes a security from the user's watchlist — same endpoint/payload as
// adding, just a DELETE instead of a POST.
const removeFromWatchlist = async (symbol: string): Promise<void> => {
  await axios.delete(`${baseUrl}/trades/securities/watchlist`, {
    data: { symbol },
  });
};

// Calculates the real estimated cost (fees, consideration, all-in total) for
// a prospective order, for the "estimated cost" figure in the buy/sell
// dialog and the Review step's cost breakdown.
const calculateTradeOrderPrice = async (
  payload: CalculateTradePricePayload,
): Promise<CalculateTradePriceResponse> => {
  const response = await axios.post<CalculateTradePriceResponse>(
    `${baseUrl}/trades/trade-order/calculate-price`,
    payload,
  );
  return response.data;
};

// Submits a buy/sell order for execution. The selected portfolio's
// signature is sent both in the body (per the payload contract) and as the
// `x-secure-token` header.
const createTradeOrder = async (
  payload: CreateTradeOrderPayload,
): Promise<CreateTradeOrderResponse> => {
  const response = await axios.post<CreateTradeOrderResponse>(
    `${baseUrl}/trades/trade-order/create`,
    payload,
    { headers: { "x-secure-token": payload.signature } },
  );
  return response.data;
};

// Fetches the available order terms (e.g. "GOOD FOR THE DAY", "GOOD TILL
// CANCEL") to populate the "Select Order Term" dropdown in the buy/sell
// dialog. Each result's `name` code — not its `label` — is what must be
// sent back as `orderTermName` on order creation.
const getOrderTerms = async (): Promise<OrderTermsResponse> => {
  const response = await axios.get<OrderTermsResponse>(
    `${baseUrl}/trades/order-terms`,
  );
  return response.data;
};

// Withdraws cash out of a trade portfolio's cash account back to the
// customer's wallet, once confirmed with the OTP from resend-otp. Same
// pattern as order creation: the portfolio's signature is sent both in the
// body and as the `x-secure-token` header.
const withdrawFromCashAccount = async (
  payload: CashAccountWithdrawPayload,
): Promise<CashAccountWithdrawResponse> => {
  const response = await axios.post<CashAccountWithdrawResponse>(
    `${baseUrl}/trades/cash-account/withdraw`,
    payload,
    { headers: { "x-secure-token": payload.signature } },
  );
  return response.data;
};

// Fetches a portfolio's past trade orders (Trade Orders page) — signature
// is the selected portfolio's own, sent as the `x-secure-token` header,
// same pattern as every other portfolio-scoped trade endpoint.
const getTradeOrderHistory = async (
  params: TradeOrderHistoryParams,
  signature: string,
): Promise<TradeOrderHistoryResponse> => {
  const response = await axios.get<TradeOrderHistoryResponse>(
    `${baseUrl}/trades/trade-order/history`,
    { params, headers: { "x-secure-token": signature } },
  );
  return response.data;
};

// Cancels a still-pending trade order (BOOKED/EXECUTING). `signature` is
// the selected portfolio's own signature, sent as the `x-secure-token`
// header, same pattern as every other trade-order mutation.
const cancelTradeOrder = async (
  payload: CancelTradeOrderPayload,
  signature: string,
): Promise<CancelTradeOrderResponse> => {
  const response = await axios.post<CancelTradeOrderResponse>(
    `${baseUrl}/trades/trade-order/cancel`,
    payload,
    { headers: { "x-secure-token": signature } },
  );
  return response.data;
};

// Funds a trade portfolio's cash account via a payment partner (card/bank,
// saved or new). The payload carries its own destination (`post_url`), so
// that's what gets POSTed to rather than a path under `baseUrl`.
// `signature` is the selected portfolio's own signature, sent as the
// `x-secure-token` header, same pattern as every other trade mutation.
const fundTradeAccount = async (
  payload: FundTradeAccountPayload,
  signature: string,
): Promise<FundTradeAccountResponse> => {
  const response = await axios.post<FundTradeAccountResponse>(
    payload.post_url,
    payload,
    { headers: { "x-secure-token": signature } },
  );
  return response.data;
};

export {
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
};
