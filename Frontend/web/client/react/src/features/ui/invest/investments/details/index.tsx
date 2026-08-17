import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Back from "../../../../../components/molecules/back";
import AssetIcon from "../../../../../assets/icons/fund-icon.svg";
import Button from "../../../../../components/atoms/buttons";
import { Menu, Tooltip, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import BuyFunds from "../../../../../components/dialogs/buy-funds";
import SellFunds from "../../../../../components/dialogs/sell-funds";
import BuyOrders from "../../../../../components/dialogs/buy-order";
import { useUser } from "../../../../../contexts/userContext";
import { usePortfoliosContext } from "../../../../../contexts/portfoliosContext";
import { useInvestment } from "../../../../../contexts/investmentsContext";
import type { FundAssetDetail, FundAssetBalance, FundTransaction } from "../../../../../models/fundAssetModel";
import {
  formatTransactionDate,
} from "../../../../../hooks/transactionHelpers";
import PaymentSuccess from "../../../../../components/dialogs/payment-success";
import RiskProfileModal from "../../../../../components/dialogs/risk-profile";
import { getEffectiveBvn } from "../../../../../hooks/effectiveBvn";
const STATUS_HEX_COLORS: Record<string, { bg: string; text: string }> = {
  executed: { bg: "#44A1851F", text: "#44A185" },
  pending: { bg: "#F8CA2A1F", text: "#F8CA2A" },
  failed: { bg: "#E5333E1F", text: "#E5333E" },
  reversed: { bg: "#8C98A41F", text: "#8C98A4" },
};
const DEFAULT_STATUS_HEX_COLOR = { bg: "#8C98A41F", text: "#8C98A4" };
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

// Auto-order / gift menu — not ready to ship yet, flip to true to bring it back.
const SHOW_FUND_ACTIONS_MENU = false;

const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
};

const AssetsDetails = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useUser();
  const showBalance = currentUser?.show_balance ?? true;
  // A minor has no BVN of its own — fund lookups fall back to the cached
  // primary (parent) account's BVN while viewing as one.
  const effectiveBvn = getEffectiveBvn(currentUser);
  const { fetchFundAssetDetails, fetchFundAssetBalance, fetchFundTransactionHistory, fetchPendingTransactions } = useInvestment();
  const { selectedPortfolio } = usePortfoliosContext();

  const [assetDetails, setAssetDetails] = useState<FundAssetDetail | null>(null);
  const [assetBalance, setAssetBalance] = useState<FundAssetBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRedemption, setPendingRedemption] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openPaymentSuccess, setOpenPaymentSuccess] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState("");
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Handle payment gateway redirect back
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    if (status === 'successful' || status === 'success' || status === 'processing' || reference || trxref) {
      if (status === 'processing') {
        const message = searchParams.get('message') || "Transaction will be completed once payment is verified.";
        setPaymentSuccessMessage(message);
        setOpenPaymentSuccess(true);
      } else if (status !== 'failed' && status !== 'cancelled') {
        setPaymentSuccessMessage("Payment successful! Your fund subscription is being processed.");
        setOpenPaymentSuccess(true);
      } else if (status === 'cancelled') {
        toast.info("Payment was cancelled.");
      } else {
        toast.error("Payment failed. Please try again.");
      }

      // Clean up the URL by removing the search params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!params.id || !effectiveBvn) return;
      const productType = searchParams.get("productType");
      try {
        setIsLoading(true);
        const res = await fetchFundAssetDetails(params.id, effectiveBvn, productType || undefined);
        if (res.success && res.data) {
          setAssetDetails(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [params.id, effectiveBvn, searchParams]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (assetDetails?.asset_code && selectedPortfolio?.id && selectedPortfolio?.signature && effectiveBvn) {
        try {
          const balanceRes = await fetchFundAssetBalance(
            effectiveBvn,
            assetDetails.asset_code,
            selectedPortfolio.id,
            selectedPortfolio.signature
          );
          if (balanceRes.success && balanceRes.data) {
            setAssetBalance(balanceRes.data);
          }
        } catch (err) {
          console.error("Failed to fetch asset balance:", err);
        }
      }
    };
    fetchBalance();
  }, [assetDetails?.asset_code, selectedPortfolio?.id, selectedPortfolio?.signature, effectiveBvn, refreshTrigger]);

  useEffect(() => {
    const fetchPending = async () => {
      const assetId = assetDetails?.asset_id || assetDetails?.id;
      if (assetId && assetDetails?.asset_code && selectedPortfolio?.signature) {
        try {
          const res = await fetchPendingTransactions(
            assetId.toString(),
            assetDetails.asset_code,
            "REDEMPTION",
            selectedPortfolio.signature
          );
          
          if (res?.data && res.data.length > 0) {
            // Find the first pending redemption
            const pending = res.data.find((t: any) => 
              t.request?.transType === "REDEMPTION" && 
              t.transaction?.status?.toLowerCase() === "pending"
            );
            if (pending) {
              setPendingRedemption({ ...pending.request, transactionId: pending.transaction?.id });
            } else {
              setPendingRedemption(null);
            }
          } else {
            setPendingRedemption(null);
          }
        } catch (err) {
          console.error("Failed to fetch pending transactions:", err);
        }
      }
    };
    fetchPending();
  }, [assetDetails, selectedPortfolio, refreshTrigger]);

  // three dot menu options
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // three dot menu options

  // state for dialog
  const [openBuyFundDialog, setBuyFundDialog] = useState(false);
  const [openSellFundDialog, setOpenSellFundDialog] = useState(false);
  const [openBuyOrderDialog, setBuyOrderDialog] = useState(false);
  const [openRiskModal, setRiskModal] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (activeTab === "transactions" && assetDetails?.id && assetDetails?.external_identifier && selectedPortfolio?.signature && selectedPortfolio?.id) {
        try {
          setIsLoadingTransactions(true);
          const res = await fetchFundTransactionHistory(
            selectedPortfolio.id,
            selectedPortfolio.signature,
            assetDetails.id,
            assetDetails.external_identifier,
            currentPage,
            pageSize
          );
          if (res.success && res.data) {
            setTransactions(res.data);
            const count = res.count || res.data.length || 0;
            setTotalItems(count);
            setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
          }
        } catch (err) {
          console.error("Failed to fetch transactions:", err);
        } finally {
          setIsLoadingTransactions(false);
        }
      }
    };
    fetchTransactions();
  }, [activeTab, assetDetails?.id, assetDetails?.external_identifier, selectedPortfolio?.signature, selectedPortfolio?.id, currentPage, pageSize]);

  const handleBuyDialogOpen = () => {
    setBuyFundDialog(true);
  };

  const handleSellDialogOpen = () => {
    if (pendingRedemption) {
      toast.info("You already have a pending redemption request. Please click the banner above to update it.");
      return;
    }
    setOpenSellFundDialog(true);
  };

  const handleBuyOrderDialogOpen = () => {
    setBuyOrderDialog(true);
  };

  const nameLower = (assetDetails?.name || "").toLowerCase();
  const codeLower = (assetDetails?.asset_code || "").toLowerCase();
  const isIPO = assetDetails?.type === 'OFFER' || assetDetails?.extRef?.ngx?.type === 'PRIMARY_OFFER' || searchParams.get("productType") !== null;

  const getRiskLevel = () => {
    if (!assetDetails) return "Conservative";
    if (isIPO) return "Aggressive";
    if (nameLower.includes("chdmmf") || nameLower.includes("money market")) return "Conservative";
    if (nameLower.includes("nigeria dollar income fund")) return "Moderate";
    if ((assetDetails.yield || 0) <= 15) return "Conservative";
    if ((assetDetails.yield || 0) <= 30) return "Moderate";
    return "Aggressive";
  };
  const riskLevel = getRiskLevel();

  return (
    <>
      <BuyFunds
        setBuyFundDialog={setBuyFundDialog}
        openBuyFundDialog={openBuyFundDialog}
        assetDetails={assetDetails}
        selectedPortfolio={selectedPortfolio}
      />
      <SellFunds
        openSellFundDialog={openSellFundDialog}
        setSellFundDialog={setOpenSellFundDialog}
        assetDetails={assetDetails}
        assetBalance={assetBalance}
        selectedPortfolio={selectedPortfolio}
        pendingTransaction={pendingRedemption}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />
      {openBuyOrderDialog && (
        <BuyOrders
          openBuyOrderDialog={openBuyOrderDialog}
          setBuyOrderDialog={setBuyOrderDialog}
        />
      )}

      {openPaymentSuccess && (
        <PaymentSuccess
          open={openPaymentSuccess}
          setOpen={setOpenPaymentSuccess}
          title="Payment processing"
          message={paymentSuccessMessage}
        />
      )}

      {openRiskModal && (
        <RiskProfileModal
          open={openRiskModal}
          setOpen={setRiskModal}
          riskLevel={riskLevel}
        />
      )}

      <div className="assets-details-wrapper mt-[46px]">
        <div className="flex flex-start">
          <Back name="Back" />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6 py-6 animate-pulse mt-[55px]">
            <div className="h-[200px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
            <div className="h-[400px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
            <div className="h-[200px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
          </div>
        ) : !assetDetails ? (
          <div className="flex justify-center items-center h-[400px]">
            <span className="text-[16px] text-[#262626]">Asset details not found.</span>
          </div>
        ) : (
          <div className="mt-[55px]">
            {(() => {
              const isFgsb = nameLower.includes("fgsb") || codeLower.includes("fgsb") || nameLower.includes("fgnsb") || codeLower.includes("fgnsb") || nameLower.includes("fgn savings bond") || nameLower.includes("savings bond") || nameLower.includes("fgn");
              const isNdif = codeLower.includes("chdndif") || nameLower.includes("dollar income fund") || nameLower.includes("ndif");
              const isNreit = codeLower.includes("nreit") || nameLower.includes("nreit") || nameLower.includes("real estate investment trust");

              const isPastClosingDate = assetDetails?.closingDate
                ? new Date(assetDetails.closingDate).getTime() < new Date().setHours(0, 0, 0, 0)
                : false;
              const isFundClosed = isPastClosingDate || (assetDetails?.fundState !== "RUNNING" && !assetDetails?.openForPurchase);

              const getRiskColor = (level: string) => {
                switch (level) {
                  case "Conservative": return "text-[#44A185] bg-[#44A185]/10 border-[#44A185]/20";
                  case "Moderate": return "text-[#EBA421] bg-[#EBA421]/10 border-[#EBA421]/20";
                  case "Aggressive": return "text-[#E5333E] bg-[#E5333E]/10 border-[#E5333E]/20";
                  default: return "text-gray-600 bg-gray-100 border-gray-200";
                }
              };

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className={`col-span-1 ${(isFgsb || isNreit) ? 'md:col-span-12 lg:col-span-12' : 'md:col-span-7 lg:col-span-8'} order-2 md:order-1`}>
                      <div className="col-1-wrapper">
                        <div className="flex gap-3 sm:gap-4 items-center">
                          <div>
                            <div className="flex h-[52px] w-[52px] sm:h-[64px] sm:w-[64px] shrink-0 items-center justify-center rounded-[12px] bg-[#F8FAFC] border border-[#EAEAEA] overflow-hidden">
                              {(!assetDetails.logo && !assetDetails.image && !assetDetails.extRef?.ngx?.logo) || imgError ? (
                                <span className="text-[#888] font-bold text-[20px] sm:text-[24px]">
                                  {(() => {
                                    const name = assetDetails.name || "";
                                    return name.split(' ').filter(word => word.length > 0).slice(0, 2).map(word => word[0]).join('').toUpperCase();
                                  })()}
                                </span>
                              ) : (
                                <img
                                  src={assetDetails.logo || assetDetails.image || assetDetails.extRef?.ngx?.logo}
                                  height="64"
                                  width="64"
                                  alt="Asset Icon"
                                  onError={() => setImgError(true)}
                                  className="object-cover h-full w-full"
                                />
                              )}
                            </div>
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="text-[14px] sm:text-[18px] text-(--text-content-subtle) font-medium leading-[20px] sm:leading-[26px]">
                              {assetDetails.name} {assetDetails.asset_code ? `• ${assetDetails.asset_code}` : ""}
                            </span>
                            <div className="mt-[4px] flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
                              <span className="text-[22px] sm:text-[28px] text-(--text-content-default) font-bold leading-[32px] sm:leading-[40px] tracking-[-0.3px]">
                                {assetDetails.currency === "NGN" ? "₦" : "$"}{assetDetails.sharePrice || assetDetails.currentValue}
                              </span>
                              <span
                                className="text-[13px] sm:text-[14px] font-medium leading-[20px] tracking-[0.1px] whitespace-nowrap"
                                style={{ color: (assetDetails.yield || 0) >= 0 ? "#44A185" : "#E5333E" }}
                              >
                                ({(assetDetails.yield || 0) > 0 ? "+" : ""}{assetDetails.yield || 0}%)
                              </span>

                              <div
                                className={`px-3 py-1 rounded-full border cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 shrink-0 whitespace-nowrap ${getRiskColor(riskLevel)}`}
                                onClick={() => setRiskModal(true)}
                              >
                                <i className="ri-shield-star-line text-[14px] shrink-0"></i>
                                <span className="text-[12px] font-semibold whitespace-nowrap">{riskLevel} Risk</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {pendingRedemption && (
                          <div className="mt-4 mb-2">
                            <div 
                              onClick={() => setOpenSellFundDialog(true)}
                              className="relative overflow-hidden cursor-pointer group bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-[16px] p-4 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(251,146,60,0.15)] hover:-translate-y-1"
                            >
                              {/* Decorative elements */}
                              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-orange-300 to-amber-400 opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity duration-300"></div>
                              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-gradient-to-tr from-amber-200 to-yellow-300 opacity-20 rounded-full blur-xl group-hover:opacity-40 transition-opacity duration-300"></div>

                              <div className="relative z-10 flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-sm border border-orange-200">
                                  <i className="ri-time-line text-[20px] animate-pulse"></i>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-[15px] font-bold text-orange-900 tracking-tight flex items-center gap-2">
                                      Pending Redemption Request
                                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-orange-500 text-white shadow-sm">Pending Approval</span>
                                    </h4>
                                    <i className="ri-arrow-right-up-line text-orange-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></i>
                                  </div>
                                  <p className="text-[13px] text-orange-800/80 leading-relaxed font-medium">
                                    Your redemption request of <span className="font-bold text-orange-900">{pendingRedemption.transUnits || 0} units</span> is currently pending approval. Click here if you'd like to update it.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-[24px]">
                          <div className="flex gap-3 flex-col md:flex-row items-center w-full">
                            <div className="w-full md:w-auto">
                              <Button
                                variant="primary"
                                disabled={isFundClosed}
                                isLoading={false}
                                className="rounded-[99px] h-[56px] px-[40px] md:px-[80px] whitespace-nowrap w-full"
                                onClick={(event) => {
                                  // MUI marks the app root aria-hidden while
                                  // a Dialog is open — blurring the trigger
                                  // first stops this button from remaining
                                  // focused inside a now aria-hidden subtree.
                                  event.currentTarget.blur();
                                  handleBuyDialogOpen();
                                }}
                              >
                                BUY
                              </Button>
                            </div>
                            {!isFgsb && !isNdif && !isNreit && !isIPO && (
                              <div className="w-full md:w-auto">
                                <Button
                                  variant="empty"
                                  disabled={!assetBalance?.totalUnitsHeld || assetBalance.totalUnitsHeld <= 0}
                                  isLoading={false}
                                  className="rounded-[99px] h-[56px] px-[40px] md:px-[80px] whitespace-nowrap w-full border-[#DCDCDC]"
                                  onClick={(event) => {
                                    event.currentTarget.blur();
                                    handleSellDialogOpen();
                                  }}
                                >
                                  Redeem
                                </Button>
                              </div>
                            )}
                            {SHOW_FUND_ACTIONS_MENU && (
                            <div>
                              <div>
                                <Button
                                  onClick={handleClick}
                                  id="user-positioned-button"
                                  aria-controls={
                                    open ? "user-positioned-menu" : undefined
                                  }
                                  aria-haspopup="true"
                                  aria-expanded={open}
                                  variant="empty"
                                  disabled={false}
                                  isLoading={false}
                                  className="rounded-[99px] h-[56px] w-[56px] px-[16px] border-[#DCDCDC]"
                                >
                                  •••
                                </Button>
                                <Menu
                                  id="user-positioned-menu"
                                  aria-labelledby="user-positioned-button"
                                  anchorEl={anchorEl}
                                  open={open}
                                  onClose={handleClose}
                                  slotProps={{
                                    paper: {
                                      sx: {
                                        borderRadius: "16px",
                                        border: "1px solid #F4F4F4",
                                        width: "360px", // Set explicit width
                                        mt: "10px", // Add top margin (offset from button)
                                        maxWidth: "100%", // Optional: ensure it doesn't break
                                        // boxShadow:'none'
                                      },
                                    },
                                  }}
                                  anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                  }}
                                  transformOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                  }}
                                >
                                  <div className="user-content-wrapper ">
                                    <div className="px-[16px] py-[12px]">
                                      <div
                                        className="flex items-center gap-[8px] cursor-pointer"
                                        onClick={() => { handleClose(); handleBuyOrderDialogOpen(); }}
                                      >
                                        <div>
                                          <i className="ri-loop-left-line text-[#0F0F0F] text-[24px]"></i>
                                        </div>
                                        <div className="flex flex-col">
                                          <div className="text-[14px] text-[#262626]leading-[20px] font-bold tracking-[0.1px]">
                                            <span>Create an auto-order</span>
                                          </div>
                                          <div className="text-[14px] text-(--text-content-muted) leading-[20px] font-normal tracking-[0.1px]">
                                            <span>
                                              Set up a recurring purchase for this fund
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="px-[16px] py-[12px]">
                                      <div
                                        className="flex items-center gap-[8px] cursor-pointer"
                                        onClick={handleClose}
                                      >
                                        <div>
                                          <i className="ri-gift-2-line text-[#0F0F0F] text-[24px]"></i>
                                        </div>
                                        <div className="flex flex-col">
                                          <div className="text-[14px] text-[#262626]leading-[20px] font-bold tracking-[0.1px]">
                                            <span>Gift this fund </span>
                                          </div>
                                          <div className="text-[14px] text-(--text-content-muted) leading-[20px] font-normal tracking-[0.1px]">
                                            <span>
                                              Buy this fund for a friend or family.
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Menu>
                              </div>
                            </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {(!isFgsb && !isNreit && !isIPO) && (
                      <div className="col-span-1 md:col-span-5 lg:col-span-4 order-1 md:order-2">
                        <div className="col-2-wrapper">
                          <div className="border border-[#FAFAFA] bg-[#FAFAFA] rounded-[12px]">
                            <div className="py-[16px] text-center">
                              <span className="text-[14px] text-(--text-content-default) font-semibold leading-[20px] tracking-[0.1px]">
                                Fund Holdings
                              </span>
                            </div>
                            <div className="px-[2px] pb-[2px]">
                              <div className="bg-white px-[24px] pt-[24px] pb-[40px] rounded-[12px]">
                                <div className="text-center text-[32px] text-(--text-content-default) font-bold leading-[44px] tracking-[-0.4px]">
                                  <span>
                                    {showBalance
                                      ? `${assetDetails?.currency === "NGN" ? "₦" : "$"}${assetBalance?.currentValueLC?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`
                                      : `${assetDetails?.currency === "NGN" ? "₦" : "$"}••••`}
                                  </span>
                                </div>
                                <div className="text-center">
                                  <span className={`text-[12px] font-medium leading-[16px] tracking-[0.2px] ${(assetBalance?.totalGainLossPercent || 0) >= 0 ? "text-[#44A185]" : "text-red-500"
                                    }`}>
                                    {(assetBalance?.totalGainLossPercent || 0) > 0 ? "+" : ""}{(assetBalance?.totalGainLossPercent || 0).toFixed(2)}%{" "}
                                  </span>
                                  <span className="text-[12px] text-(--text-content-muted) font-medium leading-[16px] tracking-[0.2px]">
                                    • {(assetBalance?.totalUnitsHeld || 0).toFixed(2)} units
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FULL WIDTH DETAILS AND ABOUT */}
                  <div className="mt-[40px] sm:mt-[64px]">
                    <div className="mb-[18px] sm:mb-[32px]">
                      <span className="text-[17px] sm:text-[20px] font-bold tracking-tight text-gray-900">Fund Details</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-[20px] sm:gap-y-[40px] gap-x-[12px] sm:gap-x-[24px]">
                      {/* Row 1 */}
                      <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                        <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                          <i className="ri-file-list-3-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                        </div>
                        <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                          <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                            Application Status
                            <Tooltip title="Current status of the fund" arrow placement="top">
                              <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                            </Tooltip>
                          </span>
                          <span className={`text-[14px] sm:text-[16px] font-bold ${!isFundClosed ? 'text-[#44A185]' : 'text-[#D93025]'}`}>
                            {!isFundClosed ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>

                      <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                        <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                          <i className="ri-money-dollar-circle-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                        </div>
                        <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                          <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                            Minimum price
                            <Tooltip title="Minimum amount required to invest" arrow placement="top">
                              <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                            </Tooltip>
                          </span>
                          <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                            {assetDetails.currency === "NGN" ? "₦" : "$"}{(Number(assetDetails.sharePrice || assetDetails.currentValue)).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                          </span>
                        </div>
                      </div>

                      <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                        <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                          <i className="ri-stack-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                        </div>
                        <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                          <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                            Multiple therefore
                            <Tooltip title="Multiple unit required for subsequent investments" arrow placement="top">
                              <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                            </Tooltip>
                          </span>
                          <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                            {assetDetails.currency === "NGN" ? "₦" : "$"}{(assetDetails.subsequentMultipleUnit * (Number(assetDetails.sharePrice || assetDetails.currentValue))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Row 2 & 3 Metrics - Hidden for NREIT, FGSB & IPOs */}
                      {(!isNreit && !isFgsb && !isIPO) && (
                        <>
                          <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                            <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                              <i className="ri-pie-chart-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                            </div>
                            <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                              <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                                Quantity
                                <Tooltip title="Number of units you own" arrow placement="top">
                                  <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                                </Tooltip>
                              </span>
                              <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                                {assetBalance?.quantity?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || "0.000"}
                              </span>
                            </div>
                          </div>

                          <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                            <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                              <i className="ri-wallet-3-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                            </div>
                            <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                              <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                                Total purchase cost
                                <Tooltip title="Total cost of your investment" arrow placement="top">
                                  <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                                </Tooltip>
                              </span>
                              <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                                {showBalance
                                  ? `${assetDetails.currency === "NGN" ? "₦" : "$"}${assetBalance?.totalPurchaseCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`
                                  : `${assetDetails.currency === "NGN" ? "₦" : "$"}••••`}
                              </span>
                            </div>
                          </div>

                          <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                            <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                              <i className="ri-price-tag-3-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                            </div>
                            <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                              <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                                Market price
                                <Tooltip title="Current price per unit" arrow placement="top">
                                  <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                                </Tooltip>
                              </span>
                              <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                                {assetDetails.currency === "NGN" ? "₦" : "$"}{assetBalance?.marketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                              </span>
                            </div>
                          </div>

                          <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                            <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                              <i className="ri-safe-2-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                            </div>
                            <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                              <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                                Market value
                                <Tooltip title="Current value of your investment" arrow placement="top">
                                  <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                                </Tooltip>
                              </span>
                              <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                                {showBalance
                                  ? `${assetDetails.currency === "NGN" ? "₦" : "$"}${assetBalance?.currentValueLC?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`
                                  : `${assetDetails.currency === "NGN" ? "₦" : "$"}••••`}
                              </span>
                            </div>
                          </div>

                          <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                            <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                              <i className="ri-line-chart-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                            </div>
                            <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                              <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                                Total gain
                                <Tooltip title="Total profit or loss" arrow placement="top">
                                  <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                                </Tooltip>
                              </span>
                              <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                                {showBalance
                                  ? `${assetDetails.currency === "NGN" ? "₦" : "$"}${assetBalance?.totalGainLoss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`
                                  : `${assetDetails.currency === "NGN" ? "₦" : "$"}••••`}
                              </span>
                            </div>
                          </div>

                          <div className="group flex items-center gap-[10px] sm:gap-[16px]">
                            <div className="flex h-[38px] w-[38px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] transition-colors duration-300 group-hover:bg-[#EAF5FA]">
                              <i className="ri-percent-line text-[16px] sm:text-[22px] text-[#8C98A4] transition-colors duration-300 group-hover:text-[#85C4DF]"></i>
                            </div>
                            <div className="flex min-w-0 flex-col gap-[2px] sm:gap-[4px]">
                              <span className="block text-[10px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#8C98A4] leading-[13px] sm:leading-[16px]">
                                Percentage gain
                                <Tooltip title="Percentage profit or loss" arrow placement="top">
                                  <i className="ri-information-line text-[#8C98A4] text-[13px] normal-case tracking-normal cursor-pointer ml-[3px] align-[-1px] inline-block"></i>
                                </Tooltip>
                              </span>
                              <span className="text-[14px] sm:text-[16px] font-bold text-[#1D2B36] whitespace-nowrap">
                                {(assetBalance?.totalGainLossPercent || 0).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* TABS SECTION */}
                  <div className="mt-[64px] border-b border-gray-100 flex gap-8">
                    <button
                      className={`pb-4 text-[16px] font-bold transition-colors duration-200 cursor-pointer ${activeTab === "about"
                          ? "text-[#1D2B36] border-b-[3px] border-[#1D2B36]"
                          : "text-[#8C98A4] hover:text-[#1D2B36]"
                        }`}
                      onClick={() => setActiveTab("about")}
                    >
                      About
                    </button>
                    <button
                      className={`pb-4 text-[16px] font-bold transition-colors duration-200 cursor-pointer ${activeTab === "transactions"
                          ? "text-[#1D2B36] border-b-[3px] border-[#1D2B36]"
                          : "text-[#8C98A4] hover:text-[#1D2B36]"
                        }`}
                      onClick={() => setActiveTab("transactions")}
                    >
                      Transactions
                    </button>
                  </div>

                  <div className="mt-[40px] min-h-[200px]">
                    {activeTab === "about" && (
                      <div className="animate-in fade-in duration-500">
                        {isIPO && assetDetails?.extRef?.ngx && (
                          <div className="mb-[48px]">
                            <div className="mb-[24px]">
                              <span className="text-[20px] font-bold tracking-tight text-gray-900">Offer Documents</span>
                              <p className="text-[14px] text-gray-500 mt-[4px]">Review the official documents for this primary offer.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
                              {assetDetails.extRef.ngx.prospectus && (
                                <a href={assetDetails.extRef.ngx.prospectus} target="_blank" rel="noreferrer" className="flex items-center gap-[16px] p-[16px] bg-white border border-[#E5E7EB] rounded-[16px] hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-blue-50 group-hover:bg-blue-100 transition-colors ml-1">
                                    <i className="ri-book-open-fill text-[24px] text-blue-600"></i>
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[15px] font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">Prospectus</span>
                                    <span className="text-[13px] text-gray-500 truncate">PDF Document</span>
                                  </div>
                                  <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-600 transition-colors">
                                    <i className="ri-download-2-line text-[16px] text-blue-600 group-hover:text-white transition-colors"></i>
                                  </div>
                                </a>
                              )}
                              
                              {assetDetails.extRef.ngx.termSheet && (
                                <a href={assetDetails.extRef.ngx.termSheet} target="_blank" rel="noreferrer" className="flex items-center gap-[16px] p-[16px] bg-white border border-[#E5E7EB] rounded-[16px] hover:border-emerald-300 hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-emerald-50 group-hover:bg-emerald-100 transition-colors ml-1">
                                    <i className="ri-file-list-3-fill text-[24px] text-emerald-600"></i>
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[15px] font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">Term Sheet</span>
                                    <span className="text-[13px] text-gray-500 truncate">PDF Document</span>
                                  </div>
                                  <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-emerald-50 group-hover:bg-emerald-600 transition-colors">
                                    <i className="ri-download-2-line text-[16px] text-emerald-600 group-hover:text-white transition-colors"></i>
                                  </div>
                                </a>
                              )}
                              
                              {assetDetails.extRef.ngx.pricingSupplement && (
                                <a href={assetDetails.extRef.ngx.pricingSupplement} target="_blank" rel="noreferrer" className="flex items-center gap-[16px] p-[16px] bg-white border border-[#E5E7EB] rounded-[16px] hover:border-violet-300 hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-violet-50 group-hover:bg-violet-100 transition-colors ml-1">
                                    <i className="ri-file-paper-2-fill text-[24px] text-violet-600"></i>
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[15px] font-bold text-gray-900 group-hover:text-violet-700 transition-colors truncate">Pricing Supplement</span>
                                    <span className="text-[13px] text-gray-500 truncate">PDF Document</span>
                                  </div>
                                  <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-violet-50 group-hover:bg-violet-600 transition-colors">
                                    <i className="ri-download-2-line text-[16px] text-violet-600 group-hover:text-white transition-colors"></i>
                                  </div>
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* <div className="mb-[24px]">
                          <span className="text-[20px] font-bold tracking-tight text-gray-900">About this Fund</span>
                        </div> */}
                        <div className="text-[15px] font-normal leading-[28px] text-gray-600 max-w-4xl">
                          <div dangerouslySetInnerHTML={{ __html: assetDetails.description || "No description available." }} />
                        </div>
                      </div>
                    )}

                    {activeTab === "transactions" && (
                      <div className="animate-in fade-in duration-500 py-6">
                        <Paper
                          elevation={0}
                          sx={{
                            width: "100%",
                            overflow: "hidden",
                            backgroundColor: "var(--surface-default)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "20px",
                            boxShadow: "0 4px 20px rgba(15, 15, 15, 0.05)",
                          }}
                        >
                          <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader aria-label="transactions table" sx={{ backgroundColor: "var(--surface-default)" }}>
                              <TableHead>
                                <TableRow>
                                  {[
                                    { label: "Description", minWidth: 220 },
                                    { label: "Type", minWidth: 100 },
                                    { label: "Units", minWidth: 100 },
                                    { label: "Price", minWidth: 100 },
                                    { label: "Amount (₦)", minWidth: 150, align: "right" as const },
                                    { label: "Status", minWidth: 130 },
                                    { label: "Date", minWidth: 170 },
                                  ].map((column) => (
                                    <TableCell
                                      key={column.label}
                                      align={column.align}
                                      style={{
                                        minWidth: column.minWidth,
                                        background: "var(--surface-sidebar)",
                                        padding: "20px 24px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        lineHeight: "20px",
                                        letterSpacing: "0.1",
                                        color: "var(--text-content-default)",
                                        border: "none",
                                        fontFamily: "Inter",
                                      }}
                                    >
                                      {column.label}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {isLoadingTransactions ? (
                                  <>
                                    {[1, 2, 3].map((i) => (
                                      <TableRow key={i}>
                                        <TableCell colSpan={7} sx={{ border: "none", p: 2 }}>
                                          <div className="h-10 bg-[#F0F0F0] rounded-[8px] animate-pulse w-full"></div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </>
                                ) : transactions.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ border: "none" }}>
                                      <div className="flex flex-col items-center justify-center py-[60px] text-center">
                                        <div className="flex items-center justify-center w-[80px] h-[80px] bg-[#F8FAFC] rounded-full mb-4">
                                          <i className="ri-history-line text-[32px] text-[#8C98A4]"></i>
                                        </div>
                                        <h3 className="text-[18px] font-bold text-[#1D2B36] mb-2">No Transactions Yet</h3>
                                        <p className="text-[15px] text-[#8C98A4] max-w-sm">
                                          You do not have any transactions for this fund yet.
                                        </p>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  transactions.map((tx) => {
                                    const isCredit = tx.transType === "SUBSCRIPTION";
                                    const statusColor = STATUS_HEX_COLORS[tx.status.toLowerCase()] ?? DEFAULT_STATUS_HEX_COLOR;
                                    return (
                                      <TableRow
                                        key={tx.id}
                                        sx={{
                                          "& td": {
                                            borderBottom: "1px solid var(--border-default)",
                                            padding: "20px 24px",
                                            color: "var(--text-content-default)",
                                            fontWeight: "500",
                                            lineHeight: "20px",
                                            letterSpacing: "0.1px",
                                            fontFamily: "Inter",
                                          },
                                        }}
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                      >
                                        <TableCell>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <span className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${isCredit ? "bg-[#E6F4EA]" : "bg-[#FCE8E6]"}`}>
                                              <i className={isCredit ? "ri-arrow-left-down-line text-[18px] text-[#44A185]" : "ri-arrow-right-up-line text-[18px] text-[#E5333E]"} />
                                            </span>
                                            <Box>
                                              <div className="text-[14px] font-semibold text-[#1D2B36]">
                                                {tx.fundLabel || tx.fundName}
                                              </div>
                                              <div className="text-[12px] text-[#8C98A4] mt-0.5 max-w-[200px] truncate">
                                                {tx.description}
                                              </div>
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <span className={`text-[14px] ${isCredit ? 'text-[#44A185]' : 'text-[#E5333E]'}`}>{tx.transType}</span>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-[14px] text-[#1D2B36]">{tx.transUnits?.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-[14px] text-[#1D2B36]">
                                            {tx.currency === "NGN" ? "₦" : "$"}{tx.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                          </span>
                                        </TableCell>
                                        <TableCell align="right">
                                          <span className="text-[14px] font-bold text-[#1D2B36]">
                                            {showBalance
                                              ? `${tx.currency === "NGN" ? "₦" : "$"}${tx.transAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                              : `${tx.currency === "NGN" ? "₦" : "$"}••••`}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <div
                                            className="inline-flex items-center justify-center rounded-[6px] px-[10px] py-[3px]"
                                            style={{ backgroundColor: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.text}` }}
                                          >
                                            <span className="text-[12px] font-bold uppercase tracking-wider">{tx.status}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-[14px] text-[#1D2B36]">{formatTransactionDate(tx.transactionDate)}</span>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {!isLoadingTransactions && (transactions.length > 0 || currentPage > 1) && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--border-default)] px-[24px] py-[16px]">
                              <div className="flex items-center gap-3 text-[13px] text-[var(--text-content-muted)] font-medium">
                                <span>
                                  Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                                </span>
                                <label className="hidden sm:flex items-center gap-[6px]">
                                  Rows per page
                                  <select
                                    value={pageSize}
                                    onChange={(e) => {
                                      setPageSize(Number(e.target.value));
                                      setCurrentPage(1);
                                    }}
                                    className="rounded-[6px] border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-content-default)] text-[13px] px-[6px] py-[2px] cursor-pointer"
                                  >
                                    {ROWS_PER_PAGE_OPTIONS.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  className="flex cursor-pointer items-center gap-1 rounded-[8px] px-[10px] py-[6px] text-[13px] font-medium text-[var(--text-content-default)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:text-[var(--text-content-muted)]"
                                >
                                  <i className="ri-arrow-left-s-line text-[16px]"></i>
                                  Previous
                                </button>

                                {getPageNumbers(currentPage, totalPages).map((item, index) =>
                                  item === "ellipsis" ? (
                                    <span
                                      key={`ellipsis-${index}`}
                                      className="px-[6px] text-[13px] text-[var(--text-content-muted)]"
                                    >
                                      …
                                    </span>
                                  ) : (
                                    <button
                                      key={item}
                                      type="button"
                                      onClick={() => setCurrentPage(item as number)}
                                      className={`h-[32px] w-[32px] cursor-pointer rounded-[8px] text-[13px] font-medium transition-colors ${
                                        item === currentPage
                                          ? "bg-[#00585E] text-white"
                                          : "text-[var(--text-content-default)] hover:bg-[var(--surface-subtle)]"
                                      }`}
                                    >
                                      {item}
                                    </button>
                                  ),
                                )}

                                <button
                                  type="button"
                                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage >= totalPages}
                                  className="flex cursor-pointer items-center gap-1 rounded-[8px] px-[10px] py-[6px] text-[13px] font-medium text-[var(--text-content-default)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:text-[var(--text-content-muted)]"
                                >
                                  Next
                                  <i className="ri-arrow-right-s-line text-[16px]"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </Paper>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
};

export default AssetsDetails;
