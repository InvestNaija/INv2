import { useParams } from "react-router-dom";
import Back from "../../../../../components/molecules/back";
import StockIcon from "../../../../../assets/icons/airtel.svg";
import Button from "../../../../../components/atoms/buttons";
import { useEffect, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import AreaChart from "../../../../../components/organisms/chart-area";
import About from "./about";
import MarketStatistics from "./market-statistics";
import OrderBook from "./orderbook";
import Transactions from "./transactions";
import BuySellSecurity from "../../../../../components/dialogs/buy-sell-security";
import MarketClosed from "../../../../../components/dialogs/market-closed";
import RemoveWatchlistConfirmation from "../../../../../components/dialogs/remove-watchlist-confirmation";
import { useTrade } from "../../../../../contexts/tradeContext";
import type { SecurityOverview } from "../../../../../models/tradeModel";
import { usePortfoliosContext } from "../../../../../contexts/portfoliosContext";
import useWatchlist from "../../../../../hooks/useWatchlist";
import { getPurchasingPower } from "../../../../../hooks/portfolioHelpers";
import { useUser } from "../../../../../contexts/userContext";
import AccountVerification from "../../../../../components/dialogs/account-verification";
import AdditionalKyc from "../../../../../components/dialogs/additional-kyc";
import isKycComplete from "../../../../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../../../../hooks/isAdditionalKycComplete";

const formatNaira = (value: number) =>
  `₦${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// NGX trading window: Mon–Fri, 9am–4pm local device time.
const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= 9 * 60 && minutesNow <= 16 * 60;
};

const SecuritiesDetails = () => {
  const params = useParams();

  // state for dialog
  const [openBuySecurityDialog, setBuySecurityDialog] = useState(false);
  const [openMarketClosedDialog, setMarketClosedDialog] = useState(false);
  const [orderType, setOrderTerm] = useState("");
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  // state for tab
  const [activeTab, setActiveTab] = useState("About");
  const tabList = ["About", "Market Statistics", "Orderbook", "Transactions"];

  const onTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // trade portfolio, for the "Buying power" figure shown in the buy/sell
  // dialog and the "My Holdings" position summary further down
  const { selectedPortfolio: tradePortfolio } = usePortfoliosContext();
  const { currentUser } = useUser();
  const showBalance = currentUser?.show_balance ?? true;

  // Gated right at the "Buy"/"Sell" click, not just at the dialog's own
  // final "Confirm order" step — no point filling out the whole form
  // first if verification/KYC is what's actually going to block it.
  const handleBuyDialogOpen = () => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    setBuySecurityDialog(true);
  };

  // security overview, fetched live from the trades API
  const { fetchSecurityOverview } = useTrade();
  const [security, setSecurity] = useState<SecurityOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // the user's watchlist — to know whether THIS security is on it (for the
  // bookmark/star icon) and to add/remove it.
  const { watchlistSecIds, isMutating, addBookmark, removeBookmark } =
    useWatchlist();
  const [openRemoveWatchlistDialog, setOpenRemoveWatchlistDialog] =
    useState(false);

  // Adding is a single tap; removing asks for confirmation first (opened
  // from the star's onClick below) since it's a destructive-feeling action.
  const handleRemoveBookmark = async () => {
    if (!security) return;
    await removeBookmark(security.symbol);
    setOpenRemoveWatchlistDialog(false);
  };

  useEffect(() => {
    if (!params.id) return;

    const fetchOverview = async () => {
      setIsLoading(true);
      try {
        const response = await fetchSecurityOverview(params.id as string);
        setSecurity(response.data);
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : "Failed to load security details";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="assets-details-wrapper mt-[46px]">
        <div className="flex flex-start">
          <Back name="Back" />
        </div>
        <div className="flex flex-col gap-6 py-6 animate-pulse">
          <div className="h-[200px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
          <div className="h-[400px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
          <div className="h-[200px] bg-[#F0F0F0] rounded-[16px] w-full"></div>
        </div>
      </div>
    );
  }

  if (!security) {
    return (
      <div className="assets-details-wrapper mt-[46px]">
        <div className="flex flex-start">
          <Back name="Back" />
        </div>
        <div className="text-center py-[120px] text-[14px] text-(--text-content-muted)">
          Unable to load this security. Please try again.
        </div>
      </div>
    );
  }

  const change = security.netChgPrevDay ?? 0;
  const changePercent = security.netChgPrevDayPerc ?? 0;
  const isPositive = change >= 0;
  const lastTrade = security.lastPx ?? security.close ?? security.price;
  const marketOpen = isMarketOpen();
  const buyingPower = tradePortfolio ? getPurchasingPower(tradePortfolio) : 0;
  const isInWatchlist = watchlistSecIds.includes(security.secId);

  // The user's existing position in this specific security, if any —
  // matched by ticker since portfolio holdings and the security overview
  // use different field names for the same value (symbol/secId vs secId).
  const myHolding = tradePortfolio?.portfolioHoldings.find(
    (holding) =>
      holding.symbol === security.symbol || holding.secId === security.secId,
  );
  const myQuantity = myHolding?.quantity ?? 0;
  const myValue = myHolding?.currentValue ?? 0;
  const ownsSecurity = myQuantity > 0;

  return (
    <>
      <BuySellSecurity
        setBuySecurityDialog={setBuySecurityDialog}
        openBuySecurityDialog={openBuySecurityDialog}
        orderType={orderType}
        security={{
          secDesc: security.secDesc,
          symbol: security.symbol,
          imageUrl: security.imageUrl,
          price: lastTrade,
        }}
        buyingPower={buyingPower}
        availableUnits={myQuantity}
        portfolio={tradePortfolio}
      />
      <RemoveWatchlistConfirmation
        open={openRemoveWatchlistDialog}
        setOpen={setOpenRemoveWatchlistDialog}
        onConfirm={handleRemoveBookmark}
        isLoading={isMutating}
        securityName={security.secDesc}
      />
      <MarketClosed
        openDialog={openMarketClosedDialog}
        setDialog={setMarketClosedDialog}
      />
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKyc}
        setAdditionalKycDialog={setOpenAdditionalKyc}
      />

      <div className="assets-details-wrapper mt-[46px]">
        <div className="flex flex-start">
          <Back name="Back" />
        </div>

        {!marketOpen && (
          <button
            type="button"
            onClick={() => setMarketClosedDialog(true)}
            className="mt-[16px] w-full flex items-center justify-between gap-2 rounded-[12px] bg-[#FDEDED] px-[16px] py-[12px] cursor-pointer"
          >
            <div className="flex items-center gap-[8px] text-[#CC1A30] text-[14px] font-medium">
              <i className="ri-time-line text-[18px]"></i>
              <span>Market is currently closed</span>
            </div>
            <i className="ri-arrow-right-s-line text-[#CC1A30] text-[18px]"></i>
          </button>
        )}

        <div className="mt-[24px]">
          <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            <div className="col-span-2 sm:order-2 xs:order-2 order-2 md:order-1 lg:order-1 xl:order-1">
              <div className="col-1-wrapper">
                <div>
                  <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-white-500 overflow-hidden">
                    <img
                      src={security.imageUrl || StockIcon}
                      height="64"
                      width="64"
                      className="object-cover"
                      alt={security.secDesc}
                      onError={(event) => {
                        event.currentTarget.src = StockIcon;
                      }}
                    />
                  </div>
                </div>
                <div className="mt-[24px]">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[18px] text-(--text-content-subtle) font-medium leading-[26px]">
                        {security.secDesc} • {security.symbol}
                      </span>
                      <div className="mt-[4px] flex items-center gap-[10px]">
                        <span className="text-[28px] text-(--text-content-default) font-bold leading-[40px] tracking-[-0.3px]">
                          {formatNaira(lastTrade)}
                        </span>
                        <span
                          className="text-[14px] font-medium leading-[20px] tracking-[0.1px]"
                          style={{ color: isPositive ? "#44A185" : "#E5333E" }}
                        >
                          {isPositive ? "+" : ""}
                          {changePercent.toFixed(2)}% (₦
                          {change.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        isInWatchlist
                          ? setOpenRemoveWatchlistDialog(true)
                          : addBookmark(security.symbol)
                      }
                      disabled={isMutating}
                      aria-label={
                        isInWatchlist
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                      className="shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <i
                        className={`${isInWatchlist ? "ri-star-fill text-[#E77731]" : "ri-star-line text-(--text-content-muted)"} text-[24px]`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="mt-[24px]">
                  <AreaChart
                    chartData={security.chartData}
                    label={security.secDesc}
                  />
                </div>

                <div className="stock-info-wrapper mt-[40px]">
                  <div className="stock-info-tab-wrapper flex gap-[16px] overflow-x-auto">
                    {tabList.map((tab) => (
                      <div
                        key={tab}
                        className={`p-[10px] flex items-center cursor-pointer capitalize  text-[16px] font-semibold leading-[24px] tracking-[0.2px] ${activeTab === tab ? "text-[#0F0F0F] border-b-3 border-[#0F0F0F] text-[#0F0F0F]" : "text-[#BFBFBF]"}`}
                        onClick={() => onTabClick(tab)}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>

                  {activeTab === "About" && (
                    <About description={security.secNotes} />
                  )}
                  {activeTab === "Market Statistics" && (
                    <MarketStatistics
                      open={security.open}
                      prevClose={security.prevClose}
                      bestBidPx={security.bestBidPx}
                      symbol={security.symbol}
                      high={security.high}
                      low={security.low}
                      bestOfferPx={security.bestOfferPx}
                    />
                  )}
                  {activeTab === "Orderbook" && (
                    <OrderBook
                      bids={security.bids}
                      offers={security.offers}
                    />
                  )}
                  {activeTab === "Transactions" && (
                    <Transactions
                      trades={security.trades}
                      secDesc={security.secDesc}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 xs:col-span-2 col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1 order-1">
              <div className="col-2-wrapper">
                <div className="border border-[#FAFAFA] bg-[#FAFAFA] rounded-[12px]">
                  <div className="py-[16px] text-center">
                    <span className="text-[14px] text-(--text-content-default) font-semibold leading-[20px] tracking-[0.1px]">
                      My Holdings
                    </span>
                  </div>
                  <div className="px-[2px] pb-[2px]">
                    <div className="bg-white px-[24px] pt-[24px] pb-[40px] rounded-[12px]">
                      {ownsSecurity ? (
                        <>
                          <div className="text-center text-[32px] text-(--text-content-default) font-bold leading-[44px] tracking-[-0.4px]">
                            <span>
                              {showBalance ? formatNaira(myValue) : "₦••••••"}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-[12px] text-(--text-content-muted) font-medium leading-[16px] tracking-[0.2px]">
                              {myQuantity.toLocaleString("en-US")} units
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <span className="text-[14px] text-(--text-content-muted) font-medium leading-[20px]">
                            You don't own {security.symbol} yet.
                          </span>
                        </div>
                      )}
                      <div className="mt-[48px] flex gap-3 items-center">
                        {ownsSecurity && (
                          <Button
                            variant="danger"
                            disabled={false}
                            isLoading={false}
                            className="rounded-[99px] h-[56px] px-[24px] whitespace-nowrap flex-1"
                            onClick={(event) => {
                              // MUI marks the app root aria-hidden while a
                              // Dialog is open — blurring the trigger first
                              // stops this button (which sits inside that
                              // root) from remaining focused inside a now
                              // aria-hidden subtree.
                              event.currentTarget.blur();
                              handleBuyDialogOpen();
                              setOrderTerm('Sell');
                            }}
                          >
                            Sell
                          </Button>
                        )}
                        <Button
                          variant="success"
                          disabled={false}
                          isLoading={false}
                          className="rounded-[99px] h-[56px] px-[24px] whitespace-nowrap flex-1"
                          onClick={(event) => {
                            event.currentTarget.blur();
                            handleBuyDialogOpen();
                            setOrderTerm('Buy');
                          }}
                        >
                          {ownsSecurity ? "Buy More" : "Buy"}
                        </Button>
                      </div>
                    </div>
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

export default SecuritiesDetails;
