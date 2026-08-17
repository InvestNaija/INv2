import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import PortfolioSelect from "../../../../components/molecules/portfolio-select";
import Button from "../../../../components/atoms/buttons";
import mainLogo from "../../../../assets/icons/investnaija-icon.svg";
import EmptyStateIcon from "../../../../components/atoms/empty-state-icon";
import AssetIcon from "../../../../assets/icons/fund-icon.svg";
import DoughnutChart, {
  PORTFOLIO_CHART_COLORS,
} from "../../../../components/organisms/chart-doughnut";
import usePortfolios from "../../../../hooks/usePortfolios";
import { useTransactionFeatures } from "../../../../contexts/transactionContext";
import formatCurrency from "../../../../hooks/FormatCurrency";
import {
  isCreditLikeTransaction,
  getTransactionTitle,
  formatTransactionDate,
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
} from "../../../../hooks/transactionHelpers";
import TransactionDetails from "../../../../components/dialogs/transaction-details";
import SaveDetails from "../../../../components/dialogs/save-details";
import InvestmentOptions from "../../../../components/dialogs/investment-options";
import AccountVerification from "../../../../components/dialogs/account-verification";
import AdditionalKyc from "../../../../components/dialogs/additional-kyc";
import isKycComplete from "../../../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../../../hooks/isAdditionalKycComplete";
import type { Transaction } from "../../../../models/transactionModel";
import { useSave } from "../../../../contexts/saveContext";
import { useUser } from "../../../../contexts/userContext";

// Ties each holding's category badge back to the same categorical colors
// as the pie chart/legend above it, so the whole card reads as one color
// system instead of a plain-text label per row.
const ASSET_TYPE_COLORS: Record<string, string> = {
  Investment: PORTFOLIO_CHART_COLORS[0],
  Trade: PORTFOLIO_CHART_COLORS[1],
  Goals: PORTFOLIO_CHART_COLORS[2],
};

const Portfolio = () => {
  const navigate = useNavigate();
  const { currentUser, updateShowBalance } = useUser();
  const showBalance = currentUser?.show_balance ?? true;
  const { portfolios: assetsPortfolios, isLoading: isLoadingAssets } = usePortfolios("assets");
  const { portfolios: tradePortfolios, isLoading: isLoadingTrade } = usePortfolios("trade");
  const { transactions, isLoading: isLoadingTransactions } = useTransactionFeatures();
  const { fetchPlaninList, fetchSaveinList, fetchOngoingPlanin, fetchOngoingSavein } = useSave();

  const isLoadingPortfolios = isLoadingAssets || isLoadingTrade;

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("main");

  // Goals have no dedicated route (unlike Investment/Trade holdings) —
  // clicking one opens the same SaveDetails dialog used on the Save tab.
  const [openSaveDetailsDialog, setSaveDetailsDialog] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanLogo, setActivePlanLogo] = useState<string | null>(null);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const [openInvestmentOptions, setInvestmentOptions] = useState(false);

  // Save plans state
  const [savePlans, setSavePlans] = useState<any[]>([]);
  const [isLoadingSave, setIsLoadingSave] = useState(true);

  useEffect(() => {
    const fetchSavePlans = async () => {
      setIsLoadingSave(true);
      try {
        const [planinRes, saveinRes, masterPlaninRes, masterSaveinRes] = await Promise.allSettled([
          fetchOngoingPlanin(),
          fetchOngoingSavein(),
          fetchPlaninList(),
          fetchSaveinList()
        ]);
        
        let combinedMaster: any[] = [];
        if (masterPlaninRes.status === "fulfilled" && masterPlaninRes.value.success) {
          combinedMaster = [...combinedMaster, ...masterPlaninRes.value.data.rows];
        }
        if (masterSaveinRes.status === "fulfilled" && masterSaveinRes.value.success) {
          combinedMaster = [...combinedMaster, ...masterSaveinRes.value.data.rows];
        }

        const planin = planinRes.status === "fulfilled" && planinRes.value.success ? planinRes.value.data : [];
        const savein = saveinRes.status === "fulfilled" && saveinRes.value.success ? saveinRes.value.data : [];
        
        const ongoing = [...planin, ...savein].map(p => {
          const matchedMaster = combinedMaster.find(c => c.id === p.saveplan_id || c.title?.toLowerCase() === p.title?.toLowerCase());
          return {
            ...p,
            master_image: matchedMaster?.logo || matchedMaster?.icon || null
          };
        });

        setSavePlans(ongoing);
      } catch {
        setSavePlans([]);
      } finally {
        setIsLoadingSave(false);
      }
    };
    fetchSavePlans();
  }, []);

  const activeAssetsPortfolios = selectedPortfolioId === "main" ? assetsPortfolios : assetsPortfolios.filter(p => p.id === selectedPortfolioId);
  const activeTradePortfolios = selectedPortfolioId === "main" ? tradePortfolios : tradePortfolios.filter(p => p.id === selectedPortfolioId);

  const totalInvestments = activeAssetsPortfolios.reduce((sum, p) => sum + (p.currentValuation?.amount || 0), 0);
  const totalTrade = activeTradePortfolios.reduce((sum, p) => sum + (p.currentValuation?.amount || 0), 0);
  const totalSave = savePlans.reduce((sum, p) => sum + (Number(p.total_paid) || Number(p.contributedAmount) || 0), 0);

  const totalPortfolioValue = totalInvestments + totalTrade + totalSave;

  const totalDollarBalance = [...activeAssetsPortfolios, ...activeTradePortfolios].reduce((sum, p) => {
    return sum + (p.portfolioHoldings || []).reduce((innerSum, holding) => {
      if (holding.currency === "USD") {
        return innerSum + (holding.currentValue ?? 0);
      }
      return innerSum;
    }, 0);
  }, 0);

  const investmentsPct = totalPortfolioValue ? Math.round((totalInvestments / totalPortfolioValue) * 100) : 0;
  const tradePct = totalPortfolioValue ? Math.round((totalTrade / totalPortfolioValue) * 100) : 0;
  const savePct = totalPortfolioValue ? Math.round((totalSave / totalPortfolioValue) * 100) : 0;

  // Shuffled (not grouped Investments-then-Trade-then-Goals) so the list
  // reads as one unified "My Holdings" rather than three stacked blocks —
  // memoized on the underlying source arrays so it doesn't re-shuffle (and
  // visibly jump around) on every unrelated re-render, only when the
  // actual holdings data changes.
  const allAssets = useMemo(() => {
    const combined = [
      ...activeAssetsPortfolios.flatMap(p => (p.portfolioHoldings || []).map(h => ({
        id: h.securityId || h.secId || Math.random().toString(),
        // Investment details route keys off asset_id (falling back to
        // securityId), same lookup portfolio-holdings-list.tsx uses.
        routeId: h.asset_id || h.securityId,
        name: h.symbol || h.secId || "Investment",
        balance: h.currentValue || 0,
        currency: h.currency || "NGN",
        _assetType: "Investment",
        logo: h.logo || AssetIcon
      }))),
      ...activeTradePortfolios.flatMap(p => (p.portfolioHoldings || []).map(h => ({
        id: h.securityId || h.secId || Math.random().toString(),
        // Trade details route keys off the ticker symbol, not securityId.
        routeId: h.symbol || h.secId,
        name: h.symbol || h.secId || "Stocks",
        balance: h.currentValue || 0,
        currency: h.currency || "NGN",
        _assetType: "Trade",
        logo: h.logo || `https://raw.githubusercontent.com/doubra-io/chd-logo/main/${h.symbol || h.secId}.png`
      }))),
      ...savePlans.map(p => ({
        id: p.id,
        // Goals have no route — this id opens the SaveDetails dialog instead.
        routeId: p.saveplan_user?.id || p.id,
        name: p.title || p.saveplan?.title || "Save Plan",
        balance: Number(p.total_paid) || Number(p.contributedAmount) || 0,
        currency: "NGN",
        _assetType: "Goals",
        logo: p.master_image || p.saveplan?.icon || mainLogo,
      })),
    ];

    // Fisher-Yates shuffle.
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined;
  }, [activeAssetsPortfolios, activeTradePortfolios, savePlans]);

  const handleOpenTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleHoldingClick = (holding: (typeof allAssets)[number]) => {
    if (holding._assetType === "Investment") {
      navigate(`/app/invest/investments/details/${holding.routeId}`);
    } else if (holding._assetType === "Trade") {
      navigate(`/app/invest/trade/details/${holding.routeId}`);
    } else {
      if (!isKycComplete(currentUser)) {
        setOpenAccountVerification(true);
        return;
      }
      if (!isAdditionalKycComplete(currentUser)) {
        setOpenAdditionalKyc(true);
        return;
      }
      setActivePlanId(holding.routeId as string);
      setActivePlanLogo(holding.logo);
      setSaveDetailsDialog(true);
    }
  };

  return (
    <>
      <div className="overview-wrapper mt-[32px]">
        <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="col-1-wrapper">
              <div className="border border-[#F4F4F4] rounded-[20px] p-[20px]">
                <div className="flex justify-between items-center gap-4">
                  <div className="shrink-0">
                    <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-bold">
                      Portfolio Performance
                    </p>
                  </div>
                  <div className="min-w-0 text-right flex justify-end">
                    <PortfolioSelect
                      portfolios={[...assetsPortfolios, ...tradePortfolios]}
                      selectedPortfolio={
                        selectedPortfolioId === "main"
                          ? null
                          : [...assetsPortfolios, ...tradePortfolios].find((p) => p.id === selectedPortfolioId) || null
                      }
                      onSelect={(portfolio) => {
                        setSelectedPortfolioId(portfolio ? portfolio.id : "main");
                      }}
                      variant="plain"
                      allowAll
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row sm:flex-col md:justify-between md:justify-between xl:justify-between lg:justify-between  items-center">
                  <div className="flex flex-col mt-[24px]">
                    <div className="text-(--text-content-subtle) text-[14px] leading-[20px] tracking-[0.1px] font-semibold ">
                      <span>Total Portfolio Value</span>
                    </div>
                    <div className="text-(--text-content-default) text-[28px] leading-[40px] tracking-[-0.3px] font-semibold flex items-center gap-[10px]">
                      {isLoadingPortfolios || isLoadingSave ? (
                        <div className="h-10 w-40 bg-[#F0F0F0] rounded animate-pulse mt-1" />
                      ) : (
                        <>
                          <span>{showBalance ? formatCurrency(totalPortfolioValue, "NGN", "en-NG") : "₦••••"}</span>
                          <button
                            type="button"
                            onClick={() => updateShowBalance(!showBalance)}
                            aria-label={showBalance ? "Hide balance" : "Show balance"}
                            className="cursor-pointer text-(--text-content-muted) hover:text-(--text-content-default)"
                          >
                            <i className={`${showBalance ? "ri-eye-line" : "ri-eye-off-line"} text-[18px]`}></i>
                          </button>
                        </>
                      )}
                    </div>
                    <div className="mt-[8px] flex">
                      <div className="flex items-center gap-[8px] rounded-[999px] border border-[#B3EBED] bg-[#F0FAFB] px-[14px] py-[7px]">
                        <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#00585E] text-[11px] font-bold text-white">
                          $
                        </span>
                        <span className="text-[14px] font-bold text-(--text-content-default)">
                          {showBalance ? formatCurrency(totalDollarBalance, "USD", "en-US") : "$••••"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-(--text-content-muted)">
                          USD
                        </span>
                      </div>
                    </div>

                    <div className="mt-[24px] flex flex-col gap-[6px]">
                      <div className="flex gap-2 items-center">
                        <i
                          className="ri-checkbox-blank-fill text-[16px]"
                          style={{ color: PORTFOLIO_CHART_COLORS[0] }}
                        ></i>
                        <div className="text-(--text-content-subtle) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                          <span>Investments ({investmentsPct}%)</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <i
                          className="ri-checkbox-blank-fill text-[16px]"
                          style={{ color: PORTFOLIO_CHART_COLORS[1] }}
                        ></i>
                        <div className="text-(--text-content-subtle) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                          <span>Trade ({tradePct}%)</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <i
                          className="ri-checkbox-blank-fill text-[16px]"
                          style={{ color: PORTFOLIO_CHART_COLORS[2] }}
                        ></i>
                        <div className="text-(--text-content-subtle) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                          <span>Goals ({savePct}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-wrapper mt-[32px]">
                    <DoughnutChart chartData={[investmentsPct, tradePct, savePct]} />
                  </div>
                </div>
              </div>

              <div className="border border-[#F4F4F4] rounded-[20px] p-[20px] mt-[20px]">
                <div className="flex justify-between items-center pt-[8px] pb-[16px]">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    Transactions
                  </p>
                  {transactions.length > 0 && (
                    <Link
                      to="/app/transactions"
                      className="flex items-center gap-1 text-(--text-content-muted) hover:text-(--text-content-default) text-[13px] font-medium"
                    >
                      See all
                      <i className="ri-arrow-right-s-line text-[16px]"></i>
                    </Link>
                  )}
                </div>
                <Divider />

                {isLoadingTransactions ? (
                  <div className="flex flex-col px-[20px] py-[20px] gap-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-[#F0F0F0]" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="h-3 bg-[#F0F0F0] rounded w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="empty-data-wrapper">
                    <div className="flex justify-center py-[64px]">
                      <div className="empty-data-content">
                        <div className="flex justify-center">
                          <EmptyStateIcon size={64} icon="ri-exchange-line" />
                        </div>
                        <div className="text-center mt-[12px] mb-[3px] text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                          <span>No transactions yet.</span>
                        </div>
                        <div className="text-center text-(--text-content-muted) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                          <span>Your transactions will appear here.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => handleOpenTransactionDetails(transaction)}
                      className="py-[16px] px-2 flex justify-between items-center cursor-pointer border-b border-[#F4F4F4] last:border-0 hover:bg-[#F9F9F9] transition-colors rounded-lg -mx-2"
                    >
                      <div className="flex gap-3 items-center">
                        <div className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${isCreditLikeTransaction(transaction) ? "bg-[#E6F4EA]" : "bg-[#FCE8E6]"}`}>
                          <i className={isCreditLikeTransaction(transaction) ? "ri-arrow-right-down-line text-[#0D904F] text-[20px]" : "ri-arrow-right-up-line text-[#D93025] text-[20px]"}></i>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] line-clamp-1">
                            {getTransactionTitle(transaction.description || "")}
                          </span>
                          <span className="font-medium text-(--text-content-subtle) text-[13px] leading-[20px]">
                            {formatTransactionDate(transaction.post_date || transaction.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-[14px] leading-[20px] tracking-[0.1px] text-(--text-content-default)">
                          {showBalance ? (
                            <>
                              {isCreditLikeTransaction(transaction) ? "" : "-"}
                              {formatCurrency(transaction.amount, transaction.currency || "NGN", "en-NG")}
                            </>
                          ) : transaction.currency === "USD" ? "$••••" : "₦••••"}
                        </span>
                        <div
                          className="inline-flex items-center justify-center rounded-[6px] px-[10px] py-[3px] text-[12px] font-bold capitalize mt-1"
                          style={{
                            color: STATUS_STYLES[transaction.status?.toLowerCase() || ""]?.text || DEFAULT_STATUS_STYLE.text,
                            backgroundColor: STATUS_STYLES[transaction.status?.toLowerCase() || ""]?.bg || DEFAULT_STATUS_STYLE.bg,
                            border: `1px solid ${STATUS_STYLES[transaction.status?.toLowerCase() || ""]?.text || DEFAULT_STATUS_STYLE.text}`
                          }}
                        >
                          {transaction.status || "Unknown"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 xs:col-span-2 col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1">
            <div className="col-2-wrapper">
              <div className="border border-[#F4F4F4] rounded-[20px] p-[20px]">
                <div className="pt-[8px] pb-[16px]">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    My Holdings
                  </p>
                </div>
                <Divider />

                {isLoadingPortfolios || isLoadingSave ? (
                  <div className="flex flex-col py-[20px] gap-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="h-10 w-10 rounded-full bg-[#F0F0F0]" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allAssets.length === 0 ? (
                  <div className="empty-data-wrapper">
                    <div className="flex justify-center py-[40px]">
                      <div className="empty-data-content">
                        <div className="flex justify-center">
                          <img src={mainLogo} height="46" width="46" className="text-black" alt="Empty Logo" />
                        </div>
                        <div className="text-center my-[12px] text-[#222] text-[14px] leading-[20px] tracking-[0.28px] font-semibold">
                          <span>Your assets will appear here</span>
                        </div>
                        <div>
                          <Button
                            variant="empty"
                            disabled={false}
                            isLoading={false}
                            className="border border[1.5px] border-[#E5E5E5] rounded-[12px] py-[8px] px-[16px]"
                            onClick={() => setInvestmentOptions(true)}
                          >
                            Start investing
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="assets-list-wrapper mt-4 max-h-[350px] overflow-y-auto">
                    {allAssets.map((portfolio) => (
                      <div
                        key={portfolio.id}
                        onClick={() => handleHoldingClick(portfolio)}
                        className="py-2 flex justify-between items-center border-b border-[#F4F4F4] last:border-0 cursor-pointer transition-colors hover:bg-(--surface-subtle) -mx-2 px-2 rounded-[12px]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border border-[#F0F0F0] bg-white overflow-hidden">
                            <img
                              src={portfolio.logo}
                              className="h-full w-full object-cover"
                              alt={portfolio.name}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const icon = portfolio._assetType === 'Investment' ? 'ri-briefcase-line text-[#00868D]'
                                  : portfolio._assetType === 'Trade' ? 'ri-stock-line text-[#0E47D8]'
                                  : 'ri-safe-line text-[#00585E]';
                                const bg = portfolio._assetType === 'Investment' ? 'bg-[#00868D]/10'
                                  : portfolio._assetType === 'Trade' ? 'bg-[#0E47D8]/10'
                                  : 'bg-[#00585E]/10';
                                e.currentTarget.parentElement!.innerHTML = `<i class="${icon} text-[16px]"></i>`;
                                e.currentTarget.parentElement!.className = `w-[32px] h-[32px] rounded-full flex items-center justify-center ${bg}`;
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-(--text-content-default)">{portfolio.name}</p>
                            <span
                              className="mt-[3px] inline-flex items-center rounded-full px-[8px] py-[1px] text-[10px] font-bold uppercase tracking-[0.3px]"
                              style={{
                                backgroundColor: `${ASSET_TYPE_COLORS[portfolio._assetType] ?? "#5A5A5A"}1A`,
                                color: ASSET_TYPE_COLORS[portfolio._assetType] ?? "#5A5A5A",
                              }}
                            >
                              {portfolio._assetType === "Trade" ? "Stocks" : portfolio._assetType}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-(--text-content-default)">
                            {showBalance
                              ? formatCurrency(
                                  portfolio.balance,
                                  portfolio.currency,
                                  portfolio.currency === "USD" ? "en-US" : "en-NG",
                                )
                              : portfolio.currency === "USD" ? "$••••" : "₦••••"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionDetails
        openDialog={!!selectedTransaction}
        transaction={selectedTransaction}
        setDialog={() => setSelectedTransaction(null)}
      />

      <SaveDetails
        openSaveDetailsDialog={openSaveDetailsDialog}
        setSaveDetailsDialog={setSaveDetailsDialog}
        activePlanId={activePlanId}
        activePlanLogo={activePlanLogo}
      />

      <InvestmentOptions
        openDialog={openInvestmentOptions}
        setDialog={setInvestmentOptions}
      />

      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKyc}
        setAdditionalKycDialog={setOpenAdditionalKyc}
      />
    </>
  );
};

export default Portfolio;
