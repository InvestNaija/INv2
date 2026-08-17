// One entry from either GET /trades/securities/recommended or GET
// /trades/securities — only the fields the securities tables actually
// render are modeled here. The two endpoints (and even /trades/securities
// itself depending on whether page/size are passed) don't return identical
// shapes: the paginated/recommended variants include trading fields like
// lastPx/netChgPrevDay/chartData/bids/offers, but the unpaginated "whole
// list" response omits lastPx and the change fields entirely — so those are
// modeled as optional, with `close`/`price` kept as fallbacks for "last
// trade" when lastPx isn't present.
export interface Security {
  id: string;
  secId: string;
  secDesc: string;
  symbol: string;
  imageUrl: string | null;
  currency: string;
  high?: number;
  low?: number;
  close?: number;
  price?: number;
  lastPx?: number;
  netChgPrevDay?: number;
  netChgPrevDayPerc?: number;
}

// Full shape of GET /trades/securities/recommended. No pagination metadata
// is returned — it's the full recommended list in one response, paginated
// client-side by the table.
export interface RecommendedSecuritiesResponse {
  status: string;
  data: Security[];
}

// Full shape of GET /trades/securities. Called without any query params —
// the whole list comes back in one response, and pagination/search are
// both done client-side once it arrives.
export interface SecuritiesListResponse {
  success: boolean;
  status: number;
  data: Security[];
  count?: number;
}

// One price/volume candle from `chartData` on the overview endpoint:
// [timestamp, open, high, low, close, volume, value].
export type SecurityChartPoint = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface OrderBookEntry {
  count: number;
  price: number;
  qty: number;
}

// One executed market trade from the overview endpoint's `trades` array.
// `lastPx` here is the trade's total value (tradePx * tradeSize), not a
// price — same field name as the top-level "last traded price", but a
// different meaning in this nested shape.
export interface SecurityTrade {
  lastPx: number;
  tradeSize: number;
  tradePx: number;
  volume: number;
  time: string;
  mdEntryID: string;
  secId: string | null;
}

// Full shape of GET /trades/security/overview/{secId} — the single-security
// details page (chart, market stats, order book, recent trades).
export interface SecurityOverview {
  id: string;
  secId: string;
  isin: string;
  secDesc: string;
  secNotes: string | null;
  imageUrl: string | null;
  symbol: string;
  name: string;
  currency: string;
  price: number;
  open: number;
  close: number;
  high: number;
  low: number;
  prevClose: number;
  lastPx: number;
  volume: number;
  volTraded: number;
  valTraded: number;
  netChgPrevDay: number;
  netChgPrevDayPerc: number;
  bestBidPx: number;
  bestBidQty: number;
  bidDepth: number;
  bestOfferPx: number;
  bestOfferQty: number;
  offerDepth: number;
  marketCode: string;
  marketOpenTime: string;
  marketCloseTime: string;
  chartData: SecurityChartPoint[];
  bids: OrderBookEntry[];
  offers: OrderBookEntry[];
  trades: SecurityTrade[];
}

export interface SecurityOverviewResponse {
  code: number;
  status: string;
  data: SecurityOverview;
}

export interface TradeOrderFeeBreakdownItem {
  name: string;
  amount: number;
}

// `amount` is the true all-in total (totalConsideration + fees, including
// the flat alert fee) — the figure to show as "estimated cost" and to
// compare against buying power. `consideration` is the raw trade value
// (quantity × price) before any fees.
export interface TradeOrderPriceCalculation {
  orderType: string;
  fees: number;
  feesBreakdown: TradeOrderFeeBreakdownItem[];
  consideration: number;
  totalConsideration: number;
  amount: number;
}

export interface CalculateTradePricePayload {
  quantityRequested: number;
  marketPrice: number;
  limitPrice: number;
  orderType: "BUY" | "SELL";
  priceType: "MARKET" | "LIMIT";
}

export interface CalculateTradePriceResponse {
  code: number;
  status: string;
  data: TradeOrderPriceCalculation;
}

// One entry from GET /trades/order-terms — populates the "Select Order
// Term" dropdown. `name` (e.g. "0001000101") is the code the backend
// actually wants back as `orderTermName` on order creation; `label` (e.g.
// "GOOD FOR THE DAY") is what's shown to the user and selected in the form.
export interface OrderTerm {
  id: number;
  active: boolean;
  name: string;
  label: string;
  fixTimeInForce: string;
  defLifeTime: number;
}

export interface OrderTermsResponse {
  code: number;
  status: string;
  data: {
    count: number;
    result: OrderTerm[];
  };
}

// Payload for POST /trades/trade-order/create. `estimatedAmount` is
// deliberately a string (2dp, no currency symbol/commas) — confirmed from a
// real payload where every other numeric field is a genuine number but this
// one is quoted. `orderTermName` is the selected OrderTerm's `name` code
// (from GET /trades/order-terms), not anything portfolio-related.
// `cashAccountId`, `portfolioName`, `signature`, and `portfolioId` come
// verbatim from the selected portfolio.
export interface CreateTradeOrderPayload {
  securityName: string;
  priceType: "MARKET" | "LIMIT";
  limitPrice: number;
  marketPrice: number;
  orderType: "BUY" | "SELL";
  orderOrigin: "WEB";
  orderDate: number;
  quantityRequested: number;
  orderCurrency: "NGN";
  orderTermName: string;
  estimatedAmount: string;
  cashAccountId: string;
  portfolioName: string;
  signature: string;
  portfolioId: string;
}

export interface CreateTradeOrderResponse {
  code: number;
  status: string;
  data: unknown;
}

// Payload for POST /trades/cash-account/withdraw — moves money out of a
// trade portfolio's cash account back to the customer's wallet. Confirmed
// via a one-time code sent through POST /auth/customers/resend-otp first;
// `token` is that code, `signature` comes from the selected portfolio (also
// sent as the `x-secure-token` header, same pattern as order creation).
export interface CashAccountWithdrawPayload {
  email: string;
  resendOtp: boolean;
  amount: number;
  portfolioId: string;
  cashAccountId: string;
  redirect_url: string;
  signature: string;
  token: string;
}

export interface CashAccountWithdrawResponse {
  code: number;
  status: string;
  data: unknown;
}

// One entry from GET /trades/trade-order/history — only the fields the
// Trade Orders table actually renders are modeled. `label` is already the
// full human-readable line ("BUY 10 - ABBEYBANK @ MARKET - NGN MARKET").
// `orderStatus` is one of BOOKED/EXECUTING/EXECUTED/CANCELLED/REJECTED/
// EXPIRED — a trade can only be cancelled while BOOKED or EXECUTING.
export interface TradeOrder {
  id: string;
  label: string;
  securityName: string;
  orderType: "BUY" | "SELL";
  priceType: "MARKET" | "LIMIT";
  orderDate: number;
  quantityRequested: number;
  orderStatus: string;
  orderTotal: number;
}

export interface TradeOrderHistoryParams {
  page: number;
  size: number;
  portfolioId: string;
  // Both "YYYY-MM-DD" strings — confirmed query param names for the date
  // range filter.
  startDate?: string;
  endDate?: string;
}

export interface TradeOrderHistoryResponse {
  code: number;
  status: string;
  message: string;
  data: {
    count: number;
    results: TradeOrder[];
  };
}

// Payload for POST /trades/trade-order/cancel — only the order's own id is
// needed; the portfolio's signature is sent as the `x-secure-token` header,
// same pattern as every other trade-order mutation.
export interface CancelTradeOrderPayload {
  id: string;
}

export interface CancelTradeOrderResponse {
  code: number;
  status: string;
  data: unknown;
}

// Payload whose destination is the request itself: `post_url` is the URL
// this exact object gets POSTed to (confirmed from a real captured
// payload) — funds a trade portfolio's cash account via a payment partner
// (Paystack today), either charging a saved card (`payment_type`/
// `saved_card_id` present) or starting a fresh card/bank payment (both
// omitted). `id`/`callback_params.asset_id` are the fixed "tradein" module
// asset id from GET /3rd-party-services/gateway, not portfolio-specific.
// `portfolioId` is deliberately the selected portfolio's `id` field (not
// its `portfolioId` field) — matches the reference implementation.
export interface FundTradeAccountPayload {
  amount: number;
  paymentMethod: "online" | "wallet";
  gateway: string;
  id: string;
  currency: "NGN";
  source: "tradein";
  type: "credit";
  description: string;
  redirect_url: string;
  post_url: string;
  callback_params: {
    module: "tradein";
    asset_id: string;
    // Only present for a fresh (non-saved) card/bank payment.
    gateway_id?: string;
    saveCard: boolean;
    brokerageInfo: Record<string, never>;
  };
  portfolioId: string;
  cashAccountId: string;
  // Saved-card charge: these two, no gateway_id/channel/channels.
  payment_type?: "saved_card";
  saved_card_id?: string;
  // Fresh card/bank payment (no saved card): these three instead, no
  // payment_type/saved_card_id. `channels` is a fixed list the gateway
  // offers on its hosted checkout page.
  gateway_id?: string;
  channel?: string;
  channels?: string[];
}

export interface FundTradeAccountResponse {
  code: number;
  status: string;
  // Present for a "new card"/hosted-checkout payment — the browser must be
  // redirected there to complete it. Absent for a saved-card charge, which
  // completes server-side with no redirect needed.
  data: {
    authorization_url?: string;
  };
}
