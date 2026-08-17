import type {
  Portfolio,
  PortfolioDetail,
  InvestmentPortfolioDetail,
} from "../models/portfolioModel";

// A portfolio's buying/purchasing power is its margin trading power when
// it has one (a margin account), otherwise just its available cash (a
// regular cash account can only buy with what's actually in it).
export const getPurchasingPower = (portfolio: Portfolio): number =>
  portfolio.marginTradingPower.amount > 0
    ? portfolio.marginTradingPower.amount
    : portfolio.availableCash.amount;

// Reconciles a GET /trades/portfolios/{id} detail response into the
// Portfolio shape the rest of the app already works with. Fields the detail
// endpoint doesn't return (portfolioClass, portfolioType, securityExchange,
// accountNo, dateOpened) are carried over from the previous snapshot since
// they don't change; `purchasingPower.amount` is mapped onto
// marginTradingPower so getPurchasingPower above picks it up as-is.
export const mergePortfolioDetail = (
  portfolio: Portfolio,
  detail: PortfolioDetail,
): Portfolio => ({
  ...portfolio,
  id: detail.id,
  active: detail.active,
  name: detail.portfolioName,
  label: detail.portfolioLabel,
  currentValuation: { currency: detail.currency, amount: detail.totalPortfolioValue },
  marginTradingPower: { currency: detail.currency, amount: detail.purchasingPower.amount },
  costBasis: { currency: detail.currency, amount: detail.totalPortfolioCost },
  availableCash: { currency: detail.currency, amount: detail.cashBalance },
  portfolioHoldings: detail.portfolioHoldings,
  percGain: detail.totalPortfolioReturnPerc,
  portfolioId: detail.portfolioId,
  cashAccountId: detail.cashAccountId,
  signature: detail.signature,
});

// Reconciles a GET /investin/portfolio-balance/{id} detail response into
// the Portfolio shape — the Investments-side sibling of
// mergePortfolioDetail above. This response has no rotating `id`,
// `portfolioId`, `cashAccountId`, or purchasing-power field the way the
// trade detail does, so those (and portfolioClass/portfolioType/
// securityExchange/accountNo/dateOpened/name/label) are all carried over
// from the previous snapshot unchanged. `currentValueLC` (not
// `currentValue`, which is just the per-unit price for a fund) is what
// maps onto PortfolioHolding.currentValue. Deliberately does NOT take
// `signature` from this response — that must always come from the
// /investin/portfolios list endpoint instead, so it's left untouched here
// (carried over via the spread).
export const mergeInvestmentPortfolioDetail = (
  portfolio: Portfolio,
  detail: InvestmentPortfolioDetail,
): Portfolio => ({
  ...portfolio,
  active: detail.active,
  currentValuation: { currency: detail.currency, amount: detail.totalPortfolioValue },
  costBasis: { currency: detail.currency, amount: detail.totalPortfolioCost },
  availableCash: { currency: detail.currency, amount: detail.cashBalance },
  portfolioHoldings: detail.portfolioHoldings.map((holding) => ({
    active: holding.active,
    securityId: String(holding.securityId),
    companyName: holding.companyName,
    symbol: holding.symbol,
    asset_id: holding.asset_id,
    quantity: holding.quantity,
    currentValue: holding.currentValueLC,
    totalGainLossPercent: holding.totalGainLossPercent,
    currency: holding.currency,
    currentValueLC: holding.currentValueLC,
    logo: holding.logo,
    yield: holding.yield,
  })),
  percGain: detail.totalPortfolioReturnPerc,
});

// Accumulates each holding's currentValueLC, grouped by its own currency
// (e.g. { NGN: 8880.08, USD: 1200 }) — used to show a secondary balance
// (USD, etc.) alongside the portfolio's main NGN total on the balance
// card, for portfolios holding a mix of local and foreign-currency
// securities.
export const getCurrencyBalances = (
  portfolio: Portfolio,
): Record<string, number> =>
  portfolio.portfolioHoldings.reduce<Record<string, number>>(
    (totals, holding) => {
      if (!holding.currency) return totals;
      totals[holding.currency] =
        (totals[holding.currency] ?? 0) + (holding.currentValueLC ?? 0);
      return totals;
    },
    {},
  );
