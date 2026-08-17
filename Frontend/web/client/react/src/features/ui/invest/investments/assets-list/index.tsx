import { useState, useEffect, useMemo, useRef } from "react";
import Funds from "./funds";
import Bonds from "./bonds";
import Offers from "./primary-offers";
import type { AssetsListCardProps } from "./interface";
import { Link } from "react-router-dom";
import { useInvestment } from "../../../../../contexts/investmentsContext";
import type { FundAsset } from "../../../../../models/fundAssetModel";
import type { IPOAsset } from "../../../../../models/ipoModel";

/** Derive a human-readable risk level from the fund's annualised yield. */
const getRiskLevel = (yieldValue: number, fundName: string): string => {
  const nameLower = fundName.toLowerCase();
  if (nameLower.includes("chdmmf") || nameLower.includes("money market")) return "Conservative";
  if (nameLower.includes("nigeria dollar income fund")) return "Moderate";
  if (yieldValue <= 15) return "Conservative";
  if (yieldValue <= 30) return "Moderate";
  return "Aggressive";
};

/** Map a raw API FundAsset into the card props shape. */
const toCardProps = (asset: FundAsset): AssetsListCardProps => ({
  asset_id: asset.asset_id,
  fundName: asset.name,
  riskLevel: getRiskLevel(asset.yield, asset.name),
  currency: asset.currency,
  price: asset.bidPrice || Number(asset.anticipatedMinPrice) || 0,
  yield: `${asset.yield}%`,
  logo: asset.logo,
});

/** Map an IPO asset into the card props shape. */
const toIPOCardProps = (asset: IPOAsset): AssetsListCardProps => ({
  asset_id: asset.asset_id,
  fundName: asset.name,
  riskLevel: "Aggressive",
  currency: asset.currency,
  price: asset.unitPrice,
  yield: asset.yield > 0 ? `${asset.yield}%` : "N/A",
  logo: asset.logo,
  productType: asset.type,
});

const AssetsList = (props: { showSeeAll: boolean }) => {
  const { fetchFundAssets, fetchBondAssets, fetchIPOOfferings, fetchOtherAssets } = useInvestment();
  const [activeTab, setActiveTab] = useState("Mutual Funds");
  const [allFundAssets, setAllFundAssets] = useState<FundAsset[]>([]);
  const [allBondAssets, setAllBondAssets] = useState<FundAsset[]>([]);
  const [allOtherAssets, setAllOtherAssets] = useState<FundAsset[]>([]);
  const [allIPOAssets, setAllIPOAssets] = useState<IPOAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fades hint that the tab strip scrolls horizontally — shown only on the
  // side there's actually more to scroll to, so they disappear once the
  // user reaches either end instead of always sitting there.
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateTabScrollFades = () => {
    const el = tabScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateTabScrollFades();
    window.addEventListener("resize", updateTabScrollFades);
    return () => window.removeEventListener("resize", updateTabScrollFades);
  }, []);

  const tabList = [
    "Mutual Funds",
    "Government Bonds",
    "IPOs",
    "Dollar Mutual Funds",
    "Others",
  ];

  // Fetch fund, bond, and IPO assets in parallel on mount.
  useEffect(() => {
    let cancelled = false;
    const fetchAssets = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const [fundRes, bondRes, ipoRes, otherRes] = await Promise.allSettled([
          fetchFundAssets(),
          fetchBondAssets(),
          fetchIPOOfferings(),
          fetchOtherAssets(),
        ]);

        if (!cancelled) {
          if (fundRes.status === "fulfilled" && fundRes.value.success && fundRes.value.data.length > 0) {
            setAllFundAssets(
              fundRes.value.data[0].Assets.filter((a: any) => a.active),
            );
          }
          if (bondRes.status === "fulfilled" && bondRes.value.success && bondRes.value.data.length > 0) {
            setAllBondAssets(bondRes.value.data[0].Assets);
          }
          if (ipoRes.status === "fulfilled" && ipoRes.value.success && ipoRes.value.data.length > 0) {
            setAllIPOAssets(ipoRes.value.data[0].Assets);
          }
          if (otherRes.status === "fulfilled" && otherRes.value.success && otherRes.value.data.length > 0) {
            setAllOtherAssets(otherRes.value.data[0].Assets);
          }

          // Only show error if ALL requests failed
          if (
            fundRes.status === "rejected" &&
            bondRes.status === "rejected" &&
            ipoRes.status === "rejected" &&
            otherRes.status === "rejected"
          ) {
            setIsError(true);
          }
        }
      } catch {
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchAssets();
    return () => {
      cancelled = true;
    };
  }, []);

  // Naira mutual funds (NGN currency)
  const nairaFunds: AssetsListCardProps[] = useMemo(
    () =>
      allFundAssets
        .filter((a) => a.currency === "NGN")
        .map(toCardProps),
    [allFundAssets],
  );

  // Dollar mutual funds (USD currency)
  const dollarFunds: AssetsListCardProps[] = useMemo(
    () =>
      allFundAssets
        .filter((a) => a.currency === "USD")
        .map(toCardProps),
    [allFundAssets],
  );

  // Government bonds
  const bondList: AssetsListCardProps[] = useMemo(
    () => allBondAssets.map(toCardProps),
    [allBondAssets],
  );

  // Others
  const otherList: AssetsListCardProps[] = useMemo(
    () => allOtherAssets.map(toCardProps),
    [allOtherAssets],
  );

  // IPO / Primary Offers
  const ipoList: AssetsListCardProps[] = useMemo(
    () => allIPOAssets.map(toIPOCardProps),
    [allIPOAssets],
  );

  const onTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // For the dashboard view limit to 3 items; the "see all" page shows all.
  const limitedNairaFunds = props.showSeeAll
    ? nairaFunds.slice(0, 3)
    : nairaFunds;
  const limitedDollarFunds = props.showSeeAll
    ? dollarFunds.slice(0, 3)
    : dollarFunds;
  const limitedBondList = props.showSeeAll
    ? bondList.slice(0, 3)
    : bondList;
  const limitedOtherList = props.showSeeAll
    ? otherList.slice(0, 3)
    : otherList;
  const limitedIPOList = props.showSeeAll
    ? ipoList.slice(0, 3)
    : ipoList;

  // Which list backs the currently active tab — used to hide "See all"
  // when that tab has nothing to show.
  const activeTabList =
    activeTab === "Mutual Funds"
      ? nairaFunds
      : activeTab === "Government Bonds"
        ? bondList
        : activeTab === "IPOs"
          ? ipoList
          : activeTab === "Dollar Mutual Funds"
            ? dollarFunds
            : otherList;

  // Empty state shown when a tab has no data.
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-[64px]">
      <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#F5F5F5] mb-[16px]">
        <i className="ri-inbox-2-line text-[36px] text-[#BFBFBF]"></i>
      </div>
      <p className="text-[16px] font-semibold text-(--text-content-default) leading-[24px]">
        {message}
      </p>
      <p className="text-[14px] text-(--text-content-subtle) leading-[20px] mt-[4px]">
        Check back later for updates
      </p>
    </div>
  );

  // Skeleton cards shown while loading.
  const LoadingSkeleton = () => (
    <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border border-[#F4F4F4] rounded-[12px] py-[32px] px-[14px] animate-pulse"
        >
          <div className="flex gap-3 items-center">
            <div className="h-[48px] w-[48px] rounded-[12px] bg-[#F0F0F0]" />
            <div className="flex flex-col gap-2">
              <div className="h-[16px] w-[60px] bg-[#F0F0F0] rounded" />
              <div className="h-[14px] w-[120px] bg-[#F0F0F0] rounded" />
            </div>
          </div>
          <div className="mt-[48px] flex justify-between">
            <div className="h-[32px] w-[60px] bg-[#F0F0F0] rounded" />
            <div className="h-[32px] w-[60px] bg-[#F0F0F0] rounded" />
            <div className="h-[32px] w-[60px] bg-[#F0F0F0] rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="assets-body-wrapper mt-[52px]">
        <div className="flex sm:flex-col flex-col xs:flex-col md:flex-row lg:flex-row xl:flex-row justify-between items-center">
          <div className="relative max-w-full">
            <div
              ref={tabScrollRef}
              onScroll={updateTabScrollFades}
              className="assets-body-tab-wrapper flex gap-[8px] sm:gap-[16px] bg-[#F5F5F5] rounded-[32px] p-[4px] max-w-full overflow-x-auto"
            >
              {tabList.map((tab) => (
                <div
                  key={tab}
                  className={`shrink-0 whitespace-nowrap p-[8px] px-[12px] sm:px-[14px] flex items-center cursor-pointer capitalize text-[14px] sm:text-[16px] font-semibold leading-[24px] tracking-[0.2px] transition-colors duration-150 active:scale-[0.97] ${activeTab === tab ? "!text-[#fff] bg-[#00585E] border border-[#00585E] rounded-[99px]" : "text-[#374151] hover:text-[#00585E]"}`}
                  onClick={() => onTabClick(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
            {/* Edge fades — the only hint (besides the cut-off last tab)
                that this strip scrolls horizontally on mobile. Each one
                only shows on the side there's actually more to reveal. */}
            <div
              aria-hidden
              className={`pointer-events-none absolute left-0 top-0 h-full w-[28px] bg-gradient-to-r from-(--surface-default) to-transparent transition-opacity duration-200 sm:hidden ${
                canScrollLeft ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute right-0 top-0 h-full w-[28px] bg-gradient-to-l from-(--surface-default) to-transparent transition-opacity duration-200 sm:hidden ${
                canScrollRight ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
          {props.showSeeAll && activeTabList.length > 0 && (
            <div className="">
              <Link to="/app/invest/investments/see-all-assets">
                <span className="text-[12px] text-[#5A5A5A] font-medium leading-[16px] tracking-[0.2px]">
                  See all
                </span>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-[16px]">
          {isLoading && <LoadingSkeleton />}

          {isError && (
            <div className="text-center py-[40px] text-[14px] text-[#E5333E]">
              Failed to load data. Please try again later.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {activeTab === "Mutual Funds" && (
                limitedNairaFunds.length > 0
                  ? <Funds fundList={limitedNairaFunds} />
                  : <EmptyState message="No mutual funds available" />
              )}
              {activeTab === "Government Bonds" && (
                limitedBondList.length > 0
                  ? <Bonds bondList={limitedBondList} />
                  : <EmptyState message="No government bonds available" />
              )}
              {activeTab === "IPOs" && (
                limitedIPOList.length > 0
                  ? <Offers offersList={limitedIPOList} />
                  : <EmptyState message="No IPOs available" />
              )}
              {activeTab === "Dollar Mutual Funds" && (
                limitedDollarFunds.length > 0
                  ? <Funds fundList={limitedDollarFunds} />
                  : <EmptyState message="No dollar mutual funds available" />
              )}
              {activeTab === "Others" && (
                limitedOtherList.length > 0
                  ? <Funds fundList={limitedOtherList} />
                  : <EmptyState message="No other assets available" />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AssetsList;