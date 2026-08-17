import { useState, useEffect, useRef } from "react";
import AllSecurities from "./all";
import Recommended from "./recommended";
import Gainers from "./gainers";
import Losers from "./losers";
import Watchlist from "./watchlist";

const ExploreSecurities = () => {
  // Recommended leads the tab list (and is the default view) since it's
  // the platform's curated pick, ahead of the raw All/Gainers/Losers lists.
  const [activeTab, setActiveTab] = useState("Recommended");
  const tabList = ["Recommended", "All", "Gainers", "Losers", "Watchlist"];

  const onTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Fades hint that the tab strip scrolls horizontally — shown only on the
  // side there's actually more to scroll to.
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

  return (
    <>
      <div className="trade-body-wrapper mt-[52px]">
        <div className="flex sm:flex-col flex-col xs:flex-col md:flex-row lg:flex-row xl:flex-row justify-between items-center">
          <div className="">
            <div>
              <span className="text-[14px] text-[#0F0F0F] font-semibold leading-[20px] tracking-[0.1px]">
                Explore Securities
              </span>
            </div>
          </div>

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
        </div>

        {activeTab === "Recommended" && <Recommended />}
        {activeTab === "All" && <AllSecurities />}
        {activeTab === "Gainers" && <Gainers />}
        {activeTab === "Losers" && <Losers />}
        {activeTab === "Watchlist" && <Watchlist />}
      </div>
    </>
  );
};

export default ExploreSecurities;
