export interface MoneyAmount {
  currency: string;
  amount: number;
}

// One entry from a portfolio's `portfolioHoldings` array. Only the fields
// the holdings list actually renders are modeled — the real response also
// carries a long tail of bond/fixed-income fields (bondCleanPrice,
// yieldToMaturity, etc.) that are always 0 for an equity holding and unused
// here. Numeric fields are optional since some have been observed missing
// on individual holdings despite appearing on others — render with `?? 0`.
export interface PortfolioHolding {
  active: boolean;
  securityId: string;
  companyName: string;
  secDesc?: string;
  symbol: string;
  secId?: string;
  asset_id?: string;
  quantity?: number;
  currentValue?: number;
  totalGainLossPercent?: number;
  // The holding's own instrument currency (e.g. "NGN", "USD") and its
  // value converted to the portfolio's base/local currency — used to
  // accumulate a per-currency balance breakdown on the balance card.
  currency?: string;
  currentValueLC?: number;
  // Present on Investments (fund) holdings, which have their own real
  // logo — absent on Trade holdings, which fall back to the generic
  // ticker-keyed CDN logo instead.
  logo?: string;
  // Fund-only annual yield rate (e.g. 17.48 for "17.48%") — absent on
  // Trade (equity) holdings.
  yield?: number;
}

// One entry from GET /trades/portfolios or GET /investin/portfolios — same
// shape for both, confirmed against a real /trades/portfolios response.
// The /investin/portfolios shape is assumed identical (sibling endpoint on
// the same backend) but hasn't been verified directly.
export interface Portfolio {
  id: string;
  active: boolean;
  name: string;
  label?: string;
  accountLabel?: string;
  portfolioClass: string;
  portfolioType: string;
  securityExchange: string;
  accountNo: string;
  dateOpened: number;
  currentValuation: MoneyAmount;
  marginTradingPower: MoneyAmount;
  costBasis: MoneyAmount;
  availableCash: MoneyAmount;
  portfolioHoldings: PortfolioHolding[];
  percGain: number;
  portfolioId: string;
  // Needed for POST /trades/trade-order/create — cashAccountId/signature
  // aren't rendered anywhere, but the order-create payload requires them
  // verbatim from the selected portfolio.
  cashAccountId: string;
  signature: string;
}

export interface PortfoliosResponse {
  code: number;
  success: boolean;
  data: Portfolio[];
}

// GET /trades/portfolios/{id} — full detail for a single portfolio, fetched
// again whenever the selected portfolio changes so the balance card shows
// live figures instead of the snapshot from the list endpoint above. Same
// portfolio, but different field names for the balance figures (and no
// portfolioClass/portfolioType/securityExchange/accountNo/dateOpened) — see
// mergePortfolioDetail in hooks/portfolioHelpers.ts for how the two are
// reconciled. portfolioHoldings here matches PortfolioHolding directly.
export interface PortfolioDetail {
  active: boolean;
  portfolioId: string;
  portfolioName: string;
  portfolioLabel: string;
  totalPortfolioValue: number;
  totalPortfolioCost: number;
  totalPortfolioReturnPerc: number;
  currency: string;
  // No `currency` key on this one in the real response (unlike MoneyAmount
  // elsewhere) — just a bare amount.
  purchasingPower: { amount: number };
  cashBalance: number;
  portfolioHoldings: PortfolioHolding[];
  cashAccountId: string;
  id: string;
  signature: string;
}

export interface PortfolioDetailResponse {
  code: number;
  status: string;
  data: PortfolioDetail;
}

// One entry from GET /investin/portfolio-balance/{id}'s `portfolioHoldings`
// — a materially different shape from the trade PortfolioHolding (numeric
// securityId, and `currentValue` here is just the per-unit price, not the
// position's total value — that's `currentValueLC` instead). Only the
// fields mergeInvestmentPortfolioDetail actually maps are modeled.
export interface InvestmentPortfolioHolding {
  active: boolean;
  securityId: number;
  companyName: string;
  symbol: string;
  asset_id?: string;
  quantity: number;
  currentValueLC: number;
  totalGainLossPercent: number;
  currency: string;
  logo: string;
  yield: number;
}

// GET /investin/portfolio-balance/{id} — full detail for a single
// investment (mutual funds) portfolio, the Investments-side sibling of
// PortfolioDetail above. Confirmed from a real response; only the fields
// mergeInvestmentPortfolioDetail (hooks/portfolioHelpers.ts) actually uses
// are modeled — the real payload also carries a long tail of per-asset-class
// breakdown fields (equityValue, bondValue, etc.) that are unused here.
// Notably has no `purchasingPower`/`cashAccountId`/rotating `id` field the
// way the trade detail response does, so those are left untouched on merge.
export interface InvestmentPortfolioDetail {
  active: boolean;
  totalPortfolioValue: number;
  totalPortfolioCost: number;
  totalPortfolioReturnPerc: number;
  cashBalance: number;
  currency: string;
  portfolioHoldings: InvestmentPortfolioHolding[];
  signature: string;
}

export interface InvestmentPortfolioDetailResponse {
  code: number;
  success: boolean;
  data: InvestmentPortfolioDetail;
  message: string;
}
