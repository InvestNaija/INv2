import type { Security } from "../models/tradeModel";
import type { SecurityListTableProps } from "../features/ui/invest/trade/explore-securities/interface";

// Maps a raw security record (from either /trades/securities/recommended or
// /trades/securities) onto the shared table row shape, so SecuritiesListTable
// doesn't need to know anything about either endpoint's response format.
// Shared by the Recommended and All tabs so both render identically.
export const toSecurityTableRow = (
  security: Security,
): SecurityListTableProps => {
  const change = security.netChgPrevDay ?? 0;
  const changePercent = security.netChgPrevDayPerc ?? 0;
  const sign = change >= 0 ? "+" : "";
  // lastPx is missing from the unpaginated /trades/securities response —
  // close/price are the next-best stand-ins for "last trade" there.
  const lastTrade = security.lastPx ?? security.close ?? security.price ?? 0;

  return {
    image: security.imageUrl ?? "",
    securityName: security.secId,
    code: security.symbol,
    secId: security.secId,
    high: security.high ?? 0,
    low: security.low ?? 0,
    priceChange: `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`,
    lastTrade,
  };
};

// Matches a query against a security row's name, ticker code, and raw
// secId, so searching "Dangote", "DANGCEM", or its secId all find the same
// row. Shared by every securities tab (All, Gainers, Losers) so search
// behaves identically everywhere.
export const filterSecuritiesByQuery = (
  securities: SecurityListTableProps[],
  query: string,
): SecurityListTableProps[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return securities;
  return securities.filter(
    (security) =>
      security.securityName.toLowerCase().includes(normalized) ||
      security.code.toLowerCase().includes(normalized) ||
      (security.secId ?? "").toLowerCase().includes(normalized),
  );
};
