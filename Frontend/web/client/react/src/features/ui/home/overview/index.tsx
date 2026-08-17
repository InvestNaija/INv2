import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../../components/atoms/buttons";
import mainLogo from "../../../../assets/icons/investnaija-icon.svg";
import EmptyStateIcon from "../../../../components/atoms/empty-state-icon";
import learntwoLogo from "../../../../assets/imgs/learn-2.svg";
import learnthreeLogo from "../../../../assets/imgs/Iearn-3.svg";
import learnfourLogo from "../../../../assets/imgs/learn-4.svg";
import AreaChart from "../../../../components/organisms/chart-area";
import { PORTFOLIO_CHART_COLORS } from "../../../../components/organisms/chart-doughnut";
import AccountValidation from "../../../../components/dialogs/account-validation";
import AdditionalKyc from "../../../../components/dialogs/additional-kyc";
import RiskAssessmentDialog from "../../../../components/dialogs/risk-assessment";
import AccountVerification from "../../../../components/dialogs/account-verification";
import InvestmentOptions from "../../../../components/dialogs/investment-options";
import TransactionDetails, {
  type TransactionLike,
} from "../../../../components/dialogs/transaction-details";
import {
  isCreditLikeTransaction,
  getTransactionTitle,
  formatTransactionDate,
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
} from "../../../../hooks/transactionHelpers";
import { useUser } from "../../../../contexts/userContext";
import { useHomeFeatures } from "../../../../contexts/homeContext";
import { useTransactionFeatures } from "../../../../contexts/transactionContext";
import AssetIcon from "../../../../assets/icons/fund-icon.svg";
import usePortfolios from "../../../../hooks/usePortfolios";
import PromoSlider from "../../../../components/organisms/promo-slider";
import formatCurrency from "../../../../hooks/FormatCurrency";
import { useSave } from "../../../../contexts/saveContext";
import isKycComplete from "../../../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../../../hooks/isAdditionalKycComplete";

// Ties each holding's category badge back to the same categorical colors
// as the Portfolio tab's pie chart/legend, so the whole app reads as one
// color system instead of a plain-text label per row.
const ASSET_TYPE_COLORS: Record<string, string> = {
  Investment: PORTFOLIO_CHART_COLORS[0],
  Trade: PORTFOLIO_CHART_COLORS[1],
  Goals: PORTFOLIO_CHART_COLORS[2],
};

const Overview = () => {
  const { currentUser, updateShowBalance, isLoading: isLoadingUser } = useUser();
  const navigate = useNavigate();
  const showBalance = currentUser?.show_balance ?? true;
  const { exploreInvestments, isLoading: isLoadingNewProducts } = useHomeFeatures();
  const { transactions, isLoading: isLoadingTransactions } =
    useTransactionFeatures();
  // One entry per real step in the Additional KYC modal (BVN, personal
  // details, bank account, next of kin) — the modal's own intro screen
  // isn't counted, it's just a summary of what's coming, not a step itself.
  const additionalKycTasks = [
    Boolean(currentUser?.bvn),
    Boolean(currentUser?.mothersMaidenName) && Boolean(currentUser?.placeOfBirth),
    Boolean(currentUser?.nuban),
    Boolean(currentUser?.nextOfKinName),
    Boolean(currentUser?.occupation),
  ];
  const completedKycTasks = additionalKycTasks.filter(Boolean).length;
  const additionalKycComplete = completedKycTasks === additionalKycTasks.length;
  const progress = (completedKycTasks / additionalKycTasks.length) * 100;

  let riskClassification = "";
  try {
    const parsed = typeof currentUser?.riskRatings === 'string' 
      ? JSON.parse(currentUser.riskRatings) 
      : currentUser?.riskRatings;
    riskClassification = parsed?.classification || "";
  } catch (e) {
    riskClassification = "";
  }
  const isRiskAssessmentComplete = currentUser?.riskRatings !== null && currentUser?.riskRatings !== undefined;

  const { portfolios: assetsPortfolios, isLoading: isLoadingAssets } = usePortfolios("assets");
  const { portfolios: tradePortfolios, isLoading: isLoadingTrade } = usePortfolios("trade");
  const { fetchPlaninList, fetchSaveinList, fetchOngoingPlanin, fetchOngoingSavein } = useSave();

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

  const isLoadingHoldings = isLoadingAssets || isLoadingTrade || isLoadingSave;

  const totalInvestments = assetsPortfolios.reduce((sum, p) => sum + (p.currentValuation?.amount || 0), 0);
  const totalTrade = tradePortfolios.reduce((sum, p) => sum + (p.currentValuation?.amount || 0), 0);
  const totalSave = savePlans.reduce((sum, p) => sum + (Number(p.total_paid) || Number(p.contributedAmount) || 0), 0);
  const totalPortfolioValue = totalInvestments + totalTrade + totalSave;

  // Holdings priced in USD rather than NGN, accumulated the same way as
  // the Portfolio tab's own USD pill — shown as a secondary balance under
  // the main NGN total.
  const totalDollarBalance = [...assetsPortfolios, ...tradePortfolios].reduce((sum, p) => {
    return sum + (p.portfolioHoldings || []).reduce((innerSum, holding) => {
      if (holding.currency === "USD") {
        return innerSum + (holding.currentValue ?? 0);
      }
      return innerSum;
    }, 0);
  }, 0);

  // Shuffled (not grouped Investments-then-Trade-then-Goals) so the list
  // reads as one unified "My Holdings" rather than three stacked blocks —
  // memoized on the underlying source arrays so it doesn't re-shuffle (and
  // visibly jump around) on every unrelated re-render, only when the
  // actual holdings data changes.
  const allAssets = useMemo(() => {
    const combined = [
      ...assetsPortfolios.flatMap(p => (p.portfolioHoldings || []).map(h => ({
        id: h.securityId || h.secId || Math.random().toString(),
        name: h.symbol || h.secId || "Investment",
        balance: h.currentValue || 0,
        _assetType: "Investment",
        logo: h.logo || AssetIcon
      }))),
      ...tradePortfolios.flatMap(p => (p.portfolioHoldings || []).map(h => ({
        id: h.securityId || h.secId || Math.random().toString(),
        name: h.symbol || h.secId || "Stocks",
        balance: h.currentValue || 0,
        _assetType: "Trade",
        logo: h.logo || `https://raw.githubusercontent.com/doubra-io/chd-logo/main/${h.symbol || h.secId}.png`
      }))),
      ...savePlans.map(p => ({
        id: p.id,
        name: p.title || p.saveplan?.title || "Save Plan",
        balance: Number(p.total_paid) || Number(p.contributedAmount) || 0,
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
  }, [assetsPortfolios, tradePortfolios, savePlans]);

  const [openAccountValidationDialog, setAccountValidationDialog] =
    useState(false);

  const [openAdditionalKycDialog, setAdditionalKycDialog] = useState(false);
  const [openRiskAssessmentDialog, setOpenRiskAssessmentDialog] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openInvestmentOptions, setInvestmentOptions] = useState(false);
  // Which transaction's tooltip (showing its full, un-shortened
  // description) is currently open, if any.
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  // The transaction currently shown in the details modal, if any.
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionLike | null>(null);
  const [openTransactionDetails, setOpenTransactionDetails] = useState(false);

  const handleOpenTransactionDetails = (transaction: TransactionLike) => {
    setSelectedTransaction(transaction);
    setOpenTransactionDetails(true);
  };

  // Closes the open tooltip when clicking anywhere outside a transaction
  // title — MUI's Tooltip doesn't add this listener itself once hover/focus
  // triggers are disabled in favor of click-to-open.
  useEffect(() => {
    if (!openTooltipId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-transaction-title]")) {
        setOpenTooltipId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openTooltipId]);

  // const handleAccountValidationDialogOpen = () => {
  //   setAccountValidationDialog(true);
  // };

  const handleAdditionalKycDialogOpen = () => {
    setAdditionalKycDialog(true);
  };

  // useEffect(() => {
  //   const openDialog = () => {
  //     if((currentUser?.firstLogin && currentUser?.status !== 'active'))
  //     handleAccountValidationDialogOpen();
  //   };

  //   openDialog();
  // }, []);

  return (
    <>
      <AccountValidation
        openAccountValidationDialog={openAccountValidationDialog}
        setAccountValidationDialog={setAccountValidationDialog}
      ></AccountValidation>
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKycDialog}
        setAdditionalKycDialog={setAdditionalKycDialog}
      ></AdditionalKyc>
      <RiskAssessmentDialog
        open={openRiskAssessmentDialog}
        setOpen={setOpenRiskAssessmentDialog}
      />
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      <InvestmentOptions
        openDialog={openInvestmentOptions}
        setDialog={setInvestmentOptions}
      />
      <TransactionDetails
        openDialog={openTransactionDetails}
        setDialog={setOpenTransactionDetails}
        transaction={selectedTransaction}
      />
      <div className="overview-wrapper mt-[32px]">
      
        <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="col-1-wrapper">
              {/* Portfolio Performance leads the dashboard — it's the number
                  the user actually came here for, so it gets the top spot
                  instead of competing with the promo carousel for attention. */}
              <div className="border border-(--border-default) rounded-[20px] p-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
                <div className="flex justify-between items-center">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-bold">
                    Portfolio Performance
                  </p>
                  <span className="text-(--text-content-muted) text-[12px] leading-[16px] font-semibold bg-(--surface-subtle) rounded-[999px] px-[10px] py-[4px]">
                    YTD
                  </span>
                </div>
                <div className="flex flex-col mt-[24px]">
                  <div className="text-(--text-content-default) text-[32px] leading-[44px] tracking-[-0.4px] font-bold flex items-center gap-[10px]">
                    {isLoadingHoldings ? (
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
                          <i className={`${showBalance ? "ri-eye-line" : "ri-eye-off-line"} text-[20px]`}></i>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-[10px] flex">
                    <div className="flex items-center gap-[8px] rounded-[999px] border border-[#B3EBED] bg-[#F0FAFB] px-[14px] py-[7px]">
                      <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#00585E] text-[11px] font-bold text-white">
                        $
                      </span>
                      <span className="text-[14px] font-bold text-(--text-content-default)">
                        {showBalance
                          ? formatCurrency(totalDollarBalance, "USD", "en-US")
                          : "$••••"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-(--text-content-muted)">
                        USD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="chart-wrapper mt-[32px]">
                  <AreaChart />
                </div>
              </div>

              {/* Compact promo strip — kept short (fixed height, cropped
                  images) so it stays visible right under the hero stat
                  without pushing My Holdings far down the page. */}
              <div className="promo-slider-wrapper border border-(--border-default) rounded-[20px] mt-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)] overflow-hidden">
                <PromoSlider />
              </div>

              {/* My Holdings sits right under the promo strip — both core
                  financial cards and the carousel stay above the fold. */}
              <div className="border border-(--border-default) rounded-[20px] p-[20px] mt-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
                <div className="flex items-center justify-between pt-[8px] pb-[16px]">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    My Holdings
                  </p>
                  {allAssets.length > 0 && (
                    <Link
                      to="/app/home/portfolio"
                      className="flex items-center gap-1 text-(--text-content-muted) hover:text-(--text-content-default) text-[13px] font-medium"
                    >
                      See all
                      <i className="ri-arrow-right-s-line text-[16px]"></i>
                    </Link>
                  )}
                </div>
                <Divider />

                {isLoadingHoldings ? (
                  <div className="flex flex-col px-[20px] py-[20px] gap-4 animate-pulse">
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
                    <div className="flex justify-center py-[32px]">
                      <div className="empty-data-content flex flex-col items-center">
                        <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#F5FBFB] border border-[#B3EBED]">
                          <img
                            src={mainLogo}
                            height="30"
                            width="30"
                            alt="Empty Logo"
                          />
                        </div>
                        <div className="text-center mt-[16px] text-(--text-content-default) text-[16px] leading-[22px] font-semibold">
                          <span>Start your investing journey</span>
                        </div>
                        <div className="text-center mt-[4px] max-w-[280px] text-(--text-content-muted) text-[13px] leading-[18px] font-medium">
                          <span>
                            Grow your money with mutual funds, stocks and more —
                            get started in minutes.
                          </span>
                        </div>
                        <div className="mt-[20px]">
                          <Button
                            variant="primary"
                            disabled={false}
                            isLoading={false}
                            className="rounded-[999px] h-[48px] px-[24px] w-fit shadow-[0_4px_14px_rgba(0,88,94,0.3)] hover:shadow-[0_6px_18px_rgba(0,88,94,0.4)] hover:-translate-y-[1px] transition-all"
                            onClick={() => setInvestmentOptions(true)}
                          >
                            <span className="flex items-center gap-2">
                              Start investing
                              <i className="ri-arrow-right-line text-[18px]"></i>
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="assets-list-wrapper mt-4 max-h-[350px] overflow-y-auto">
                    {allAssets.slice(0, 5).map((portfolio, idx) => (
                      <div key={`${portfolio.id}-${idx}`} className="py-2 flex justify-between items-center border-b border-[#F4F4F4] last:border-0">
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
                        <div className="flex flex-col text-right">
                          <p className="text-[14px] font-bold text-(--text-content-default)">{showBalance ? formatCurrency(portfolio.balance, "NGN", "en-NG") : "₦••••"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-(--border-default) rounded-[20px] p-[20px] mt-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
                <div className="flex items-center justify-between pt-[8px] pb-[16px]">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    Recent Transactions
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
                        <div></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  transactions.map((transaction, idx) => (
                    <div
                      key={`${transaction.id}-${idx}`}
                      onClick={() => handleOpenTransactionDetails(transaction)}
                      className="py-[16px] px-2 flex justify-between items-center cursor-pointer border-b border-[#F4F4F4] last:border-0 hover:bg-[#F9F9F9] transition-colors rounded-lg -mx-2"
                    >
                      <div className="flex gap-3 items-center">
                        <div className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${isCreditLikeTransaction(transaction) ? "bg-[#E6F4EA]" : "bg-[#FCE8E6]"}`}>
                          <i
                            className={
                              isCreditLikeTransaction(transaction)
                                ? "ri-arrow-right-down-line text-[20px] text-[#0D904F]"
                                : "ri-arrow-right-up-line text-[20px] text-[#D93025]"
                            }
                          ></i>
                        </div>
                        <div className="flex flex-col">
                          <Tooltip
                            title={transaction.description}
                            open={openTooltipId === transaction.id}
                            disableFocusListener
                            disableTouchListener
                            arrow
                            placement="top"
                          >
                            <span
                              data-transaction-title
                              onClick={(e) => {
                                // Don't also open the details modal — this
                                // click is just for the quick-peek tooltip.
                                e.stopPropagation();
                                setOpenTooltipId((prev) =>
                                  prev === transaction.id ? null : transaction.id,
                                );
                              }}
                              onMouseEnter={() => setOpenTooltipId(transaction.id)}
                              onMouseLeave={() =>
                                setOpenTooltipId((prev) =>
                                  prev === transaction.id ? null : prev,
                                )
                              }
                              className="text-(--text-content-default) text-left text-[14px] leading-[20px] tracking-[0.1px] font-medium cursor-pointer w-fit"
                            >
                              {getTransactionTitle(transaction.description)}
                            </span>
                          </Tooltip>
                          <span className="text-(--text-content-muted) text-left text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                            {formatTransactionDate(transaction.post_date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-semibold text-[14px] leading-[20px] tracking-[0.1px] text-(--text-content-default)">
                          {showBalance ? (
                            <>
                              {isCreditLikeTransaction(transaction) ? "" : "-"}
                              {formatCurrency(transaction.amount, transaction.currency || "NGN", "en-NG")}
                            </>
                          ) : "₦••••"}
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
           
              {isLoadingUser || currentUser?.isMinor ? null : !additionalKycComplete ? (
              <div
                className="border border-[#FAD1B6] rounded-[20px] px-[20px] py-[24px] bg-[#FFECDF] cursor-pointer"
                onClick={handleAdditionalKycDialogOpen}
              >
                <div className="flex justify-between items-center">
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-flex",
                        }}
                      >
                        <CircularProgress
                          variant="determinate"
                          size={64}
                          thickness={6}
                          enableTrackSlot
                          value={progress}
                          aria-label=""
                          sx={{ color: "#EB9148", marginBottom: 0 }}
                          //   {...props}
                        />
                        <Box
                          sx={{
                            top: 3,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: "absolute",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            component="div"
                            sx={{
                              color: "#222",
                              fontSize: 16,
                              fontWeight: 600,
                            }}
                          >{`${completedKycTasks}/${additionalKycTasks.length}`}</Typography>
                        </Box>
                      </Box>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#222] text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                        Get your money working
                      </span>
                      <span className="text-[#3B3B3B] text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                        {" "}
                        Finish setting up your account
                      </span>
                    </div>
                  </div>
                  <div>
                    <i className="ri-arrow-right-s-line text-[24px] text-[#222222]"></i>
                  </div>
                </div>
              </div>
              ) : !isRiskAssessmentComplete ? (
              <div
                className="border border-[#BEE7F2] rounded-[20px] px-[20px] py-[24px] bg-[#E8F8FC] cursor-pointer"
                onClick={() => setOpenRiskAssessmentDialog(true)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#CCEFF6]">
                      <i className="ri-survey-line text-[28px] text-[#00727A]"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#222] text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                        Know your risk appetite
                      </span>
                      <span className="text-[#3B3B3B] text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                        Complete your risk assessment
                      </span>
                    </div>
                  </div>
                  <div>
                    <i className="ri-arrow-right-s-line text-[24px] text-[#222222]"></i>
                  </div>
                </div>
              </div>
              ) : null}

              <div className={`border border-(--border-default) rounded-[20px] p-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)] ${(!additionalKycComplete || !isRiskAssessmentComplete) ? "mt-[20px]" : ""}`}>
                <div className="pt-[8px] pb-[16px] flex justify-between items-center">
                  <p className="text-(--text-content-default) text-[16px] leading-[24px] tracking-[0.1px] font-bold">
                    Explore Investments
                  </p>
                  <button
                    onClick={() => setInvestmentOptions(true)}
                    className="relative flex items-center justify-center w-[36px] h-[36px] shrink-0 rounded-full bg-gradient-to-br from-[#E77731] to-[#EA580C] text-white transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(231,119,49,0.4)] hover:shadow-[0_8px_20px_rgba(231,119,49,0.5)] hover:scale-110 group"
                    title="View Investment Options"
                  >
                    {/* Ping ring behind the icon draws the eye without dimming the button itself (animate-pulse would fade the icon, so we use a separate absolutely-positioned ring instead). */}
                    <span className="absolute inset-0 rounded-full bg-[#E77731] opacity-75 animate-ping"></span>
                    <i className="relative ri-apps-2-line text-[20px] group-hover:rotate-90 transition-transform duration-500 ease-out"></i>
                  </button>
                </div>
                <Divider />
                {isLoadingNewProducts ? (
                  <div className="flex flex-col px-[20px] py-[20px] gap-4 animate-pulse">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-[#F0F0F0]" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
                          <div className="h-3 bg-[#F0F0F0] rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !exploreInvestments || exploreInvestments.length === 0 ? (
                  <div className="text-center py-[24px] text-(--text-content-muted) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                    <span>No new products to explore right now.</span>
                  </div>
                ) : (
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {exploreInvestments?.map((product, idx) => (
                      <div
                        key={`${product.id}-${idx}`}
                        onClick={() => {
                          if (!isKycComplete(currentUser)) {
                            setOpenAccountVerification(true);
                            return;
                          }
                          if (!isAdditionalKycComplete(currentUser)) {
                            setAdditionalKycDialog(true);
                            return;
                          }
                          if (product.module === "Save") {
                            navigate(`/app/save/drill-down/${product.id}`);
                          } else if (product.module === "Trade") {
                            navigate(`/app/invest/trade/details/${product.id}`);
                          } else {
                            navigate(`/app/invest/investments/details/${product.id}`);
                          }
                        }}
                        className="py-[16px] px-[16px] -mx-[16px] flex justify-between items-center border-b border-gray-100 last:border-0 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:scale-[1.01] hover:rounded-[16px] hover:border-transparent hover:z-10 relative cursor-pointer transition-all duration-300 ease-out group"
                      >
                        <div className="flex gap-4 items-center flex-1 min-w-0">
                          {(() => {
                            const hasImage = !!(product.image || product.logo);
                            const bgClass = hasImage 
                              ? 'bg-transparent border border-gray-100'
                              : (product.type === 'Saving' ? 'bg-[#f0f5ff] text-[#2F80ED]' : product.type === 'Fund' ? 'bg-[#fff7ed] text-[#E77731]' : product.type === 'Bond' ? 'bg-[#f5fef8] text-[#20B03F]' : 'bg-[#fef9c3] text-[#F2C94C]');
                            return (
                              <div className={`rounded-full w-[44px] h-[44px] flex items-center justify-center overflow-hidden shrink-0 ${bgClass}`}>
                                {hasImage ? (
                                  <img
                                    src={product.image || product.logo}
                                    className="w-full h-full object-cover"
                                    alt={product.title}
                                  />
                                ) : (
                                  <span className="text-[14px] font-bold tracking-wider">
                                    {product.shortName}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          <div className="flex flex-col flex-1 min-w-0 pr-2">
                            <span className="text-(--text-content-default) text-left text-[16px] leading-[24px] font-medium line-clamp-1">
                              {product.title}
                            </span>
                            <span className="text-[#9CA3AF] text-left text-[13px] leading-[18px] font-normal line-clamp-1">
                              {product.type} • {product.riskLevel || "Medium risk"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-2">
                          <span className="text-(--text-content-default) text-right text-[16px] leading-[24px] font-semibold tracking-tight">
                            {product.priceFormatted}
                          </span>
                          <span className={`${product.returnFormatted?.includes('-') ? 'text-[#EF4444]' : 'text-[#20B03F]'} text-right text-[13px] leading-[18px] font-medium flex items-center gap-1`}>
                            {product.returnFormatted && (
                              <i className={`${product.returnFormatted.includes('-') ? 'ri-arrow-down-line' : 'ri-arrow-up-line'} text-[12px]`}></i>
                            )}
                            {product.returnFormatted?.replace('-', '')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-(--border-default) rounded-[20px] p-[20px] mt-[20px] shadow-[0_4px_20px_rgba(15,15,15,0.05)]">
                <div className="pt-[8px] pb-[16px]">
                  <p className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                    Grow Your Knowledge
                  </p>
                </div>
                <Divider />
                <div className="py-[16px] flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="w-fit bg-[#ffe5e8] rounded-[8px] px-[8px] py-[4px] text-(--text-content-critical) text-[10px] leading-[12px] tracking-[0.3px] font-semibold">
                      <span className="">New</span>
                    </div>
                    <div className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                      <span>
                        Introduction to the buying and investing in valuable
                        assets
                      </span>
                    </div>
                    <div className="text-(--text-content-muted) text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                      <span>Video</span>•<span>Jan 13 2025</span>•
                      <span>12 mins</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-[8px]">
                    <img
                      src={learnthreeLogo}
                      height="100"
                      width="90"
                      className="text-black"
                      alt="InvestNaija Logo"
                    />
                  </div>
                </div>

                <Divider />
                <div className="py-[16px] flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="w-fit bg-[#ffe5e8] rounded-[8px] px-[8px] py-[4px] text-(--text-content-critical) text-[10px] leading-[12px] tracking-[0.3px] font-semibold">
                      <span className="">New</span>
                    </div>
                    <div className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                      <span>
                        For Your Information - Fireside chat with Bolaji Balogun
                      </span>
                    </div>
                    <div className="text-(--text-content-muted) text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                      <span>Podcast</span>•<span>Jan 13 2025</span>•
                      <span>12 mins</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-[8px]">
                    <img
                      src={learntwoLogo}
                      height="100"
                      width="90"
                      className="text-black"
                      alt="InvestNaija Logo"
                    />
                  </div>
                </div>

                <Divider />
                <div className="py-[16px] flex justify-between items-center">
                  <div className="flex flex-col">
                    {/* <div className="w-fit bg-[#ffe5e8] rounded-[8px] px-[8px] py-[4px] text-(--text-content-critical) text-[10px] leading-[12px] tracking-[0.3px] font-semibold">
                      <span className="">New</span>
                    </div> */}
                    <div className="text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                      <span>
                        Building on your existing experience as an entrepreneur
                      </span>
                    </div>
                    <div className="text-(--text-content-muted) text-[12px] leading-[16px] tracking-[0.2px] font-medium">
                      <span>Article</span>•<span>Sep 14 2025</span>•
                      <span>12 mins</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-[8px]">
                    <img
                      src={learnfourLogo}
                      height="100"
                      width="90"
                      className="text-black"
                      alt="InvestNaija Logo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
