import { Link, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import fundLogo from "../../assets/icons/Indicator.svg";
import EmptyStateIcon from "../atoms/empty-state-icon";
import type { PortfolioHolding } from "../../models/portfolioModel";
import { useUser } from "../../contexts/userContext";
import formatCurrency from "../../hooks/FormatCurrency";

interface PortfolioHoldingsListProps {
  holdings: PortfolioHolding[];
  isLoading?: boolean;
  // Omit on a page that already IS the full holdings list (e.g. the "see
  // all" breakdown page itself) — the header just shows the title then.
  seeAllHref?: string;
  // Where clicking a holding navigates to (ticker gets appended) — differs
  // between Trade and Investments, which have separate details pages.
  detailsBasePath?: string;
  name?: string;
}

// "My Holdings" list shown alongside the portfolio balance card — same
// bordered-card convention as the Watchlist card next to it, populated
// from the selected portfolio's real holdings instead of a static list.
const 
PortfolioHoldingsList = ({
  holdings,
  isLoading = false,
  seeAllHref,
  name,
  detailsBasePath = "/app/invest/trade/details",
}: PortfolioHoldingsListProps) => {
  const { currentUser } = useUser();
  const showBalance = currentUser?.show_balance ?? true;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col border border-[#F4F4F4] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
      <div className="shrink-0 px-[20px] py-[16px] flex justify-between items-center bg-(--surface-subtle)">
        <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-bold">
          {name}
        </p>
        {seeAllHref && holdings.length > 0 && (
          <Link to={seeAllHref}>
            <div className="cursor-pointer flex gap-1 items-center group">
              <span className="font-semibold text-[#00727A] text-[13px] leading-[20px] tracking-[0.1px] group-hover:underline">
                See all
              </span>
              <i className="ri-arrow-right-s-line text-[18px] text-[#00727A]"></i>
            </div>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col px-[20px] py-[20px] gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="h-10 w-10 rounded-full bg-[#F0F0F0]" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
                <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : holdings.length === 0 ? (
        <div className="flex flex-col items-center text-center px-[20px] py-[40px]">
          <EmptyStateIcon size={40} />
          <p className="mt-[12px] text-[13px] text-(--text-content-muted)">
            You don't have any holdings yet.
          </p>
        </div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto px-[20px]">
          {holdings.map((holding, index) => {
            const quantity = holding.quantity ?? 0;
            const currentValue = holding.currentValue ?? 0;
            const percentGain = holding.totalGainLossPercent ?? 0;
            const isPositive = percentGain >= 0;
            const name = holding.companyName || holding.secDesc;
            const ticker = holding.symbol || holding.secId;
            // Investments (fund) holdings carry their own real logo URL —
            // Trade holdings don't, so those fall back to the CDN path
            // keyed by ticker (symbol/secId, e.g. "ACCESSCORP"), same
            // pattern seen on /trades/securities and
            // /trades/security/overview.
            const logoUrl =
              holding.logo ||
              `https://raw.githubusercontent.com/doubra-io/chd-logo/main/${ticker}.png`;

            const routeParam = detailsBasePath.includes("investments")
              ? holding.asset_id || holding.securityId
              : ticker;

            return (
              <div
                key={holding.securityId}
                onClick={() => navigate(`${detailsBasePath}/${routeParam}`)}
                className={`py-[14px] flex justify-between items-center gap-3 cursor-pointer transition-colors hover:bg-(--surface-subtle) -mx-[8px] px-[8px] rounded-[12px] ${index !== holdings.length - 1
                    ? "border-b border-[#F4F4F4]"
                    : ""
                  }`}
              >
                <div className="flex gap-[10px] items-center min-w-0">
                  <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full border border-[#F0F0F0] bg-white overflow-hidden">
                    <img
                      src={logoUrl}
                      className="h-full w-full object-cover"
                      alt={name}
                      onError={(event) => {
                        event.currentTarget.src = fundLogo;
                      }}
                    />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-(--text-content-default) text-left text-[14px] leading-[20px] tracking-[0.1px] font-semibold truncate">
                      {ticker}
                    </span>
                    <span className="text-(--text-content-muted) text-left text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                      {quantity.toLocaleString("en-US")} units
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-[6px] shrink-0">
                  <span className="text-(--text-content-default) text-right text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    {showBalance
                      ? formatCurrency(
                        currentValue,
                        holding.currency || "NGN",
                        holding.currency === "USD" ? "en-US" : "en-NG",
                      )
                      : holding.currency === "USD" ? "$••••" : "₦••••"}
                  </span>
                  <span
                    className={`flex items-center gap-[2px] text-[12px] font-semibold px-[8px] py-[2px] rounded-[999px] ${isPositive
                        ? "bg-[#E7F5EE] text-[#44A185]"
                        : "bg-[#FDEAEC] text-[#E5333E]"
                      }`}
                  >
                    <i
                      className={`${isPositive ? "ri-arrow-up-line" : "ri-arrow-down-line"} text-[12px]`}
                    ></i>
                    {Math.abs(percentGain).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioHoldingsList;
