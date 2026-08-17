import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../../components/organisms/header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ConvertToTitleCase from "../../../hooks/convertToTitleCase";
import Search from "../../../components/molecules/search";
import fundLogo from "../../../assets/icons/Indicator.svg";
import { useTrade } from "../../../contexts/tradeContext";
import { useUser } from "../../../contexts/userContext";
import {
  filterSecuritiesByQuery,
  toSecurityTableRow,
} from "../../../hooks/securityHelpers";
import type { SecurityListTableProps } from "./trade/explore-securities/interface";

const Invest = () => {
  const { fetchSecurities: contextFetchSecurities } = useTrade();
  const { currentUser } = useUser();
  // navigate and get url path
  const navigate = useNavigate();
  const location = useLocation();

  // state for tab
  const [activeTab, setActiveTab] = useState("Investments");
  // Trade isn't available on a dependent account (see features/ui/invest/trade/index.tsx's redirect).
  const tabList = currentUser?.isMinor ? ["Investments"] : ["Investments", "Trade"];

  // Split the pathname and filter out empty strings (like the trailing slash)
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Get the last item in the array
  const secondPath = pathSegments[pathSegments.length - 2];
  const lastPath = pathSegments[pathSegments.length - 1];

  const onTabClick = useCallback(
    (tab: string) => {
      setActiveTab(tab);

      if (tab === "Investments") {
        navigate("investments/dashboard");
      } else if (tab === "Trade") {
        navigate("trade/dashboard");
      }
    },
    [navigate]
  );

  useEffect(() => {
    const refreshTabClick = () => {
      if (lastPath === "dashboard") {
        onTabClick(ConvertToTitleCase(secondPath));
      }
    };

    refreshTabClick();
  }, [secondPath, lastPath, onTabClick]);

  // Stock search beside the Trade tab — fetched once (the same "All"
  // securities endpoint as the Explore Securities "All" tab) the first time
  // the Trade tab is shown, then filtered client-side per keystroke.
  const [securities, setSecurities] = useState<SecurityListTableProps[]>([]);
  const [isLoadingSecurities, setIsLoadingSecurities] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const hasFetchedSecurities = useRef(false);

  useEffect(() => {
    if (activeTab !== "Trade" || hasFetchedSecurities.current) {
      return;
    }
    hasFetchedSecurities.current = true;

    const fetchSecurities = async () => {
      setIsLoadingSecurities(true);
      try {
        const response = await contextFetchSecurities();
        setSecurities(response.data.map(toSecurityTableRow));
      } catch {
        // Non-critical — the search box just won't return results if this
        // fails; no need to surface an error for a nav-bar search input.
      } finally {
        setIsLoadingSecurities(false);
      }
    };

    fetchSecurities();
  }, [activeTab]);

  // Closes the results dropdown on an outside click.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery
    ? filterSecuritiesByQuery(securities, searchQuery).slice(0, 8)
    : [];

  const handleSelectSecurity = (security: SecurityListTableProps) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(`/app/invest/trade/details/${security.secId ?? security.code}`);
  };

  return (
    <>
      <div className="invest-wrapper">
        <div className="header-wrapper">
          <Header></Header>
        </div>

        <div className="mt-[52px]">
          {lastPath === 'dashboard' ? (
            <div className="invest-body-wrapper mt-[24px]">
                <div className="flex sm:flex-col flex-col xs:flex-col md:flex-row lg:flex-row xl:flex-row justify-between items-center gap-[16px] md:gap-0">
              <div className="invest-body-tab-wrapper flex gap-[16px] overflow-x-auto w-full md:w-auto">
                {tabList.map((tab) => (
                  <div
                    key={tab}
                    className={`p-[10px] flex items-center cursor-pointer capitalize  text-[16px] font-semibold leading-[24px] tracking-[0.2px] ${activeTab === tab ? "text-[#0F0F0F] border-b-3 border-[#0F0F0F]" : "text-[#374151] hover:text-[#0F0F0F] transition-colors duration-150"}`}
                    onClick={() => onTabClick(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <div className="w-full md:w-auto">{activeTab === "Trade" && (
                <div className="relative w-full md:w-[320px] lg:w-[320px] xl:w-[320px]" ref={searchWrapperRef}>
                <Search
                placeholder="Search Securities"
                  variant="primary"
                  value={searchQuery}
                  onChange={(event) => {
                    
                    setSearchQuery(event.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="border border-[#F5F5F5] rounded-[999px] px-[12px] py-[8px] h-[48px] "
                />

                {isSearchOpen && searchQuery && (
                  <div className="absolute z-10 mt-[8px] w-full rounded-[16px] border border-(--border-default) bg-(--surface-default) shadow-[0_8px_28px_rgba(15,15,15,0.1)] overflow-hidden">
                    {isLoadingSecurities ? (
                      <div className="px-[16px] py-[16px] flex flex-col gap-3 animate-pulse">
                        <div className="h-4 bg-[#F0F0F0] rounded-[4px] w-3/4"></div>
                        <div className="h-4 bg-[#F0F0F0] rounded-[4px] w-1/2"></div>
                        <div className="h-4 bg-[#F0F0F0] rounded-[4px] w-5/6"></div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-[16px] py-[16px] text-[13px] text-(--text-content-muted)">
                        No securities found for "{searchQuery}".
                      </div>
                    ) : (
                      searchResults.map((security, index) => (
                        <div
                          key={`${security.code}-${index}`}
                          onClick={() => handleSelectSecurity(security)}
                          className="flex items-center gap-[10px] px-[16px] py-[12px] cursor-pointer hover:bg-(--surface-subtle) border-b border-(--border-default) last:border-b-0"
                        >
                          <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-(--surface-subtle) overflow-hidden">
                            <img
                              src={security.image || fundLogo}
                              className="h-full w-full object-cover"
                              alt={security.securityName}
                              onError={(event) => {
                                event.currentTarget.src = fundLogo;
                              }}
                            />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] text-(--text-content-default) font-semibold truncate">
                              {security.securityName}
                            </span>
                            <span className="text-[12px] text-(--text-content-muted)">
                              {security.code}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>)}</div>
              </div>
            </div>
          ) : null}
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Invest;
