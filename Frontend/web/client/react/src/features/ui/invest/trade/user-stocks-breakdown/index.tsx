import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Back from "../../../../../components/molecules/back";
import StockIcon from "../../../../../assets/icons/airtel.svg";
import EmptyStateIcon from "../../../../../components/atoms/empty-state-icon";
import { usePortfoliosContext } from "../../../../../contexts/portfoliosContext";
import formatCurrency from "../../../../../hooks/FormatCurrency";
import { useUser } from "../../../../../contexts/userContext";
import TradeOrdersList from "../../../../../components/organisms/trade-orders-list";

const UserStocksBreakdown = () => {
  const { selectedPortfolio, isLoading, isError, refetch } =
    usePortfoliosContext();
  const { currentUser } = useUser();
  const showBalance = currentUser?.show_balance ?? true;
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const holdings = selectedPortfolio?.portfolioHoldings ?? [];

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += offset;
    }
  };

  return (
    <>
      <div className="my-stocks-wrapper mt-[46px]">
        <div className="flex flex-start py-[20px]">
          <Back name="Back" />
        </div>

        <div className="@container md:px-[80px] lg:px-[80px] xl:px-[80px] px-[10px] sm:px-[10px] mt-[24px]">
          <div className="my-stocks-content-wrapper">
            <div className="">
              <h6 className="text-[28px] leading-[40px] font-bold text-[#0F0F0F] tracking-[-0.3]">
                My Holdings
              </h6>
            </div>

            {isError ? (
              <div className="mt-[16px] flex items-center justify-between gap-2 rounded-[12px] bg-[#FDEDED] px-[16px] py-[12px]">
                <span className="text-[#CC1A30] text-[14px] font-medium">
                  Unable to load your holdings.
                </span>
                <button
                  type="button"
                  onClick={refetch}
                  className="cursor-pointer text-[#CC1A30] text-[14px] font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : isLoading ? (
              <div className="mt-[25px] flex flex-col gap-4 py-[12px] animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="h-[48px] w-[48px] rounded-full bg-[#F0F0F0]" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-[16px] w-1/3 bg-[#F0F0F0] rounded" />
                      <div className="h-[12px] w-1/4 bg-[#F0F0F0] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : holdings.length === 0 ? (
              <div className="mt-[25px] flex flex-col items-center text-center py-[24px]">
                <EmptyStateIcon size={40} />
                <p className="mt-[12px] text-[13px] text-(--text-content-muted)">
                  You don't have any holdings yet.
                </p>
              </div>
            ) : (
              <div className="mt-[25px] flex items-center">
                <div
                  ref={scrollRef}
                  style={{
                    display: "flex",
                    overflowX: "scroll",
                    scrollBehavior: "smooth",
                  }}
                  className="gap-4 py-[24px] px-[8px] -my-[24px] -mx-[8px]"
                >
                  {holdings.map((holding) => {
                    const quantity = holding.quantity ?? 0;
                    const currentValue = holding.currentValue ?? 0;
                    const percentGain = holding.totalGainLossPercent ?? 0;
                    const isPositive = percentGain >= 0;
                    const name = holding.companyName || holding.secDesc;
                    const ticker = holding.symbol || holding.secId;
                    const logoUrl = `https://raw.githubusercontent.com/doubra-io/chd-logo/main/${ticker}.png`;

                    return (
                      <div
                        key={holding.securityId}
                        onClick={() =>
                          navigate(`/app/invest/trade/details/${ticker}`)
                        }
                        className="shrink-0 w-[180px] bg-white border border-[#E5E7EB] rounded-[24px] p-[20px] cursor-pointer hover:border-transparent hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-[4px] transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center w-full">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gray-200 blur-md rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 transform scale-110" />
                            <span className="relative flex h-[56px] w-[56px] items-center justify-center rounded-full border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden group-hover:scale-[1.05] transition-transform duration-300">
                              <img
                                src={logoUrl}
                                className="h-[70%] w-[70%] object-contain"
                                alt={name}
                                onError={(event) => {
                                  event.currentTarget.src = StockIcon;
                                }}
                              />
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col w-full">
                            <span className="text-[15px] text-gray-900 font-bold leading-tight tracking-tight truncate w-full px-2">
                              {ticker}
                            </span>
                            <span className="mt-[6px] text-[13px] text-gray-500 font-medium leading-none">
                              {quantity.toLocaleString("en-US")} units
                            </span>
                          </div>

                          <div className="mt-5 flex flex-col items-center w-full">
                            <span className="text-[18px] text-gray-900 font-bold tracking-tight">
                              {showBalance
                                ? formatCurrency(currentValue, "NGN", "en-NG")
                                : "₦••••"}
                            </span>
                            
                            <div className="mt-[10px]">
                              <span
                                className={`inline-flex items-center gap-[4px] text-[12px] font-bold px-[8px] py-[4px] rounded-lg transition-colors ${
                                  isPositive
                                    ? "bg-[#E6F4EA] text-[#137333] group-hover:bg-[#CEEAD6]"
                                    : "bg-[#FCE8E6] text-[#C5221F] group-hover:bg-[#FAD2CF]"
                                }`}
                              >
                                <i
                                  className={`${isPositive ? "ri-arrow-up-line" : "ri-arrow-down-line"} text-[14px]`}
                                ></i>
                                {Math.abs(percentGain).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {holdings.length > 3 && (
                  <div>
                    <div
                      onClick={() => scroll(200)}
                      className="cursor-pointer flex h-[32px] w-[32px] items-center justify-center rounded-[999px] bg-[#EEE] ml-[8px]"
                    >
                      <i className="ri-arrow-right-s-line rounded-[99px] text-[24px] text-(--text-content-subtle)"></i>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-[48px]">
            <div>
              <h6 className="text-[16px] leading-[24px] font-bold text-[#0F0F0F] ">
                Trade Orders
              </h6>
            </div>

            <div className="mt-[12px]">
              <TradeOrdersList portfolio={selectedPortfolio} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserStocksBreakdown;
