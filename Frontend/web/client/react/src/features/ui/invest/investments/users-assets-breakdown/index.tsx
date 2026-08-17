import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Back from "../../../../../components/molecules/back";
import AssetIcon from "../../../../../assets/icons/fund-icon.svg";
import { Divider } from "@mui/material";
import { usePortfoliosContext } from "../../../../../contexts/portfoliosContext";
import formatCurrency from "../../../../../hooks/FormatCurrency";
import { useUser } from "../../../../../contexts/userContext";

const UserAssetsBreakdown = () => {
  const { selectedPortfolio } = usePortfoliosContext();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const showBalance = currentUser?.show_balance ?? true;
  
  const holdings = selectedPortfolio?.portfolioHoldings ?? [];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += offset;
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    // const target = event.currentTarget;

  };


    return (
       <>
      <div className="my-assets-wrapper mt-[46px]">
        <div className="flex flex-start py-[20px]">
          <Back name="Back" />
        </div>

        <div className="@container md:px-[150px] lg:px-[150px] xl:px-[150px] px-[10px] sm:px-[10px] mt-[24px]">
          <div className="my-stocks-content-wrapper">
            <div className="">
              <h6 className="text-[28px] leading-[40px] font-bold text-[#0F0F0F] tracking-[-0.3]">
                My Holdings
              </h6>
            </div>

            <div className="mt-[25px] flex items-center">
              {/* <button onClick={() => scroll(-200)}>Left</button> */}
              <div
                ref={scrollRef}
                style={{
                  display: "flex",
                  overflowX: "scroll",
                  scrollBehavior: "smooth",
                }}
                onScroll={handleScroll}
                className="gap-4 py-[24px] px-[8px] -my-[24px] -mx-[8px]"
              >
                {/* Dynamic Cards */}
                {holdings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-[40px] w-full">
                    <p className="text-[14px] text-(--text-content-muted)">You don't have any holdings yet.</p>
                  </div>
                ) : (
                  holdings.map((holding) => {
                    const quantity = holding.quantity ?? 0;
                    const currentValueLC = holding.currentValueLC ?? 0;
                    const percentGain = holding.totalGainLossPercent ?? 0;
                    const isPositive = percentGain >= 0;
                    const name = holding.companyName || holding.secDesc;
                    const ticker = holding.symbol || holding.secId;
                    const logoUrl = holding.logo || `https://raw.githubusercontent.com/doubra-io/chd-logo/main/${ticker}.png`;
                    const routeParam = holding.asset_id || holding.securityId || ticker;

                    return (
                      <div
                        key={holding.securityId}
                        onClick={() => navigate(`/app/invest/investments/details/${routeParam}`)}
                        className="shrink-0 w-[200px] bg-white border border-[#E5E7EB] rounded-[24px] p-[20px] cursor-pointer hover:border-transparent hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-[4px] transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden"
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
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = AssetIcon;
                                }}
                              />
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col w-full">
                            <div className="min-h-[42px] flex items-start justify-center">
                              <span className="text-[14px] text-gray-900 font-bold leading-[20px] tracking-tight line-clamp-2 w-full px-2" title={name}>
                                {name}
                              </span>
                            </div>
                            <span className="mt-[6px] text-[13px] text-gray-500 font-medium leading-none">
                              {quantity.toLocaleString("en-US")} units
                            </span>
                          </div>

                          <div className="mt-5 flex flex-col items-center w-full">
                            <span className="text-[18px] text-gray-900 font-bold tracking-tight">
                              {showBalance
                                ? formatCurrency(
                                    currentValueLC,
                                    holding.currency || "NGN",
                                    holding.currency === "USD" ? "en-US" : "en-NG",
                                  )
                                : "••••"}
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
                  })
                )}
              </div>
              
              {holdings.length > 0 && (
                <div>
                  <div
                    onClick={() => scroll(200)}
                    className="cursor-pointer flex h-[32px] w-[32px] items-center justify-center rounded-[999px] bg-[#EEE]"
                  >
                    <i className="ri-arrow-right-s-line text-[24px] text-(--text-content-subtle)"></i>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-[48px]">
            <div>
              <h6 className="text-[16px] leading-[24px] font-bold text-[#0F0F0F] ">
                Transactions
              </h6>
            </div>

            <div>
              <div className="mt-[12px] sm:w-[100%] xs:w-[100%] w-[100%] md:w-[552px] lg:w-[552px] xl:w-[552px]">
                <div className="flex justify-between items-center py-[16px]">
                  <div className="flex gap-2">
                    <div>
                      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[99px] bg-white-500">
                        <img
                          src={AssetIcon}
                          height="48"
                          width="48"
                          alt="Asset Icon"
                             className="rounded-[99px]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div>
                        <span className="text-[#0F0F0F] font-normal text-[14px] leading-[20px] tracking-[0.1px]">
                         Money Market Fund (MMF)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#BFBFBF] font-medium text-[12px] leading-[20px] tracking-[0.1px]">
                          Buy • April 23
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#0F0F0F] font-medium text-[14px] leading-[20px] tracking-[0.1px]">
                      ₦199,970.00
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-[16px]">
                  <div className="flex gap-2">
                    <div>
                      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[99px] bg-white-500">
                        <img
                            src={AssetIcon}
                          height="48"
                          width="48"
                          alt="Asset Icon"
                             className="rounded-[99px]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div>
                        <span className="text-[#0F0F0F] font-normal text-[14px] leading-[20px] tracking-[0.1px]">
                       Nigerian Bond Fund (NBF)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#BFBFBF] font-medium text-[12px] leading-[20px] tracking-[0.1px]">
                          Sale • April 23
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#0F0F0F] font-medium text-[14px] leading-[20px] tracking-[0.1px]">
                      ₦99,970.00
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-[16px]">
                  <div className="flex gap-2">
                    <div>
                      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[99px] bg-white-500">
                        <img
                       src={AssetIcon}
                          height="48"
                          width="48"
                          className="rounded-[99px]"
                          alt="Asset Icon"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div>
                        <span className="text-[#0F0F0F] font-normal text-[14px] leading-[20px] tracking-[0.1px]">
                    Money Market Fund (MMF)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#BFBFBF] font-medium text-[12px] leading-[20px] tracking-[0.1px]">
                          Buy • April 23
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#0F0F0F] font-medium text-[14px] leading-[20px] tracking-[0.1px]">
                      ₦10,970.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    )
}

export default UserAssetsBreakdown;