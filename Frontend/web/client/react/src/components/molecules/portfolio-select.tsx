import { useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type { Portfolio } from "../../models/portfolioModel";

// Shown once ever (per browser) to point out the switcher exists, since
// it's easy to miss when it just looks like a static label — dismissed by
// its own close button, tapping the trigger, or after a few seconds either
// way.
const HINT_SEEN_KEY = "portfolio-switch-hint-seen";
const HINT_AUTO_DISMISS_MS = 6000;

interface PortfolioSelectProps {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  onSelect: (portfolio: Portfolio | null) => void;
  // "pill" matches the original bordered white select box used on the
  // Trade/Investments dashboards; "plain" is bare text + chevron for
  // sitting directly on a colored surface.
  variant?: "pill" | "plain";
  isTrade?: boolean;
  allowAll?: boolean;
}

const getPortfolioLabel = (portfolio: Portfolio, isTrade?: boolean) =>
  isTrade ? `${portfolio.accountLabel || portfolio.label} - ${portfolio.accountNo}` : `${portfolio.accountLabel || portfolio.label} - ${portfolio.name}`;

// Reusable portfolio switcher — shared by the Trade and Investments balance
// cards so a user with more than one portfolio (e.g. NGX Regular vs a
// margin account) can switch which one the card/holdings reflect.
const PortfolioSelect = ({
  portfolios,
  selectedPortfolio,
  onSelect,
  variant = "pill",
  isTrade = false,
  allowAll = false,
}: PortfolioSelectProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Only worth pointing out when there's actually more than one portfolio
  // to switch between, and only the first time this browser ever sees it —
  // `dismissed` starts false and is derived alongside that, rather than set
  // from inside the effect, so the effect only owns the auto-dismiss timer.
  const [dismissed, setDismissed] = useState(false);
  const showHint = !dismissed && portfolios.length > 1;

  useEffect(() => {
    if (!showHint) return;
    const timeout = setTimeout(() => setDismissed(true), HINT_AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [showHint]);

  const dismissHint = () => {
    setDismissed(true);
    localStorage.setItem(HINT_SEEN_KEY, "1");
  };

  if (!selectedPortfolio && !allowAll) return null;

  const triggerClassName =
    variant === "pill"
      ? "w-auto min-w-[143px] max-w-[200px] md:max-w-[280px] justify-between px-4 py-2 bg-white border border-[#E5E5E5] text-[#0F0F0F] rounded-[20px] shadow-[0_1px_2px_rgba(15,15,15,0.04)] hover:border-[#00727A]/40 hover:bg-[#F5FBFB] hover:shadow-[0_4px_12px_rgba(0,114,122,0.1)] active:scale-[0.98]"
      : "gap-[6px] text-[#00727A] min-w-[143px] max-w-[200px] md:max-w-[280px] justify-between hover:opacity-80 active:scale-[0.98]";

  return (
    <div className="relative inline-block min-w-0">
      {showHint && (
        <>
        <style>{`
          @keyframes portfolioHintIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div
          role="tooltip"
          className="absolute left-0 top-[calc(100%+10px)] z-20 w-[220px] animate-[portfolioHintIn_0.3s_ease] rounded-[16px] bg-[#00585E] px-[14px] py-[12px] text-white shadow-[0_12px_28px_rgba(0,88,94,0.3)]"
        >
          <div className="absolute -top-[6px] left-[24px] h-[12px] w-[12px] rotate-45 bg-[#00585E]"></div>
          <div className="relative flex items-start gap-[8px]">
            <i className="ri-cursor-line mt-[1px] shrink-0 text-[16px] text-[#8FE3D9]"></i>
            <p className="flex-1 text-[13px] font-medium leading-[18px]">
              Click on the drop down to change portfolio
            </p>
            <button
              type="button"
              onClick={dismissHint}
              aria-label="Dismiss"
              className="shrink-0 cursor-pointer text-white/70 hover:text-white"
            >
              <i className="ri-close-line text-[16px]"></i>
            </button>
          </div>
        </div>
        </>
      )}
      <button
        type="button"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          if (showHint) dismissHint();
        }}
        aria-haspopup="true"
        aria-expanded={open}
        className={`cursor-pointer flex items-center text-[14px] font-semibold tracking-[0.1px] transition-all duration-200 ${triggerClassName}`}
      >
        <span className="truncate">
          {selectedPortfolio ? getPortfolioLabel(selectedPortfolio, isTrade) : "All portfolio"}
        </span>
        <i
          className={`ri-arrow-down-s-line text-[18px] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        ></i>
      </button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              border: "1px solid var(--border-default)",
              boxShadow: "0 8px 28px rgba(15,15,15,0.1)",
              mt: "8px",
              minWidth: "280px",
              maxWidth: "350px",
              overflow: "hidden",
            },
          },
          list: { sx: { p: 0 } },
        }}
      >
        <div className="px-[16px] pt-[14px] pb-[8px] text-[12px] font-semibold uppercase tracking-[0.4px] text-(--text-content-muted)">
          Switch portfolio
        </div>

        {allowAll && (
          <MenuItem
            selected={!selectedPortfolio}
            onClick={() => {
              onSelect(null);
              setAnchorEl(null);
            }}
            sx={{
              px: "16px",
              py: "12px",
              gap: "12px",
              borderTop: "1px solid var(--border-default)",
              "&.Mui-selected": {
                backgroundColor: "rgba(0, 114, 122, 0.06)",
              },
              "&.Mui-selected:hover": {
                backgroundColor: "rgba(0, 114, 122, 0.1)",
              },
            }}
          >
            <span
              className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                !selectedPortfolio
                  ? "bg-[#00727A] text-white"
                  : "bg-(--surface-subtle) text-(--text-content-subtle)"
              }`}
            >
              A
            </span>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-semibold text-(--text-content-default) truncate">
                All portfolio
              </span>
              <span className="text-[12px] text-(--text-content-muted) truncate">
                View all assets
              </span>
            </div>

            {!selectedPortfolio && (
              <i className="ri-check-line text-[18px] text-[#00727A] shrink-0"></i>
            )}
          </MenuItem>
        )}

        {portfolios.map((portfolio, index) => {
          const uniqueKey = portfolio.portfolioId || portfolio.accountNo || portfolio.id || String(index);
          const isSelected = Boolean(!!selectedPortfolio && (
            (portfolio.portfolioId && portfolio.portfolioId === selectedPortfolio.portfolioId) ||
            (portfolio.accountNo && portfolio.accountNo === selectedPortfolio.accountNo) ||
            (portfolio.id && portfolio.id === selectedPortfolio.id)
          ));
          
          return (
            <MenuItem
              key={uniqueKey}
              selected={isSelected}
              onClick={() => {
                onSelect(portfolio);
                setAnchorEl(null);
              }}
              sx={{
                px: "16px",
                py: "12px",
                gap: "12px",
                borderTop: "1px solid var(--border-default)",
                "&.Mui-selected": {
                  backgroundColor: "rgba(0, 114, 122, 0.06)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(0, 114, 122, 0.1)",
                },
              }}
            >
              <span
                className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                  isSelected
                    ? "bg-[#00727A] text-white"
                    : "bg-(--surface-subtle) text-(--text-content-subtle)"
                }`}
              >
                {portfolio.portfolioType?.charAt(0) || "P"}
              </span>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[14px] font-semibold text-(--text-content-default) truncate">
                  {portfolio.portfolioType} • {portfolio.securityExchange}
                </span>
                <span className="text-[12px] text-(--text-content-muted) truncate">
                  {portfolio.accountLabel || portfolio.label}
                </span>
              </div>

              {isSelected && (
                <i className="ri-check-line text-[18px] text-[#00727A] shrink-0"></i>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

export default PortfolioSelect;
