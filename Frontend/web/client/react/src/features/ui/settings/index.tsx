import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ConvertToTitleCase from "../../../hooks/convertToTitleCase";
import { useUser } from "../../../contexts/userContext";

const tabIcons: Record<string, string> = {
  Profile: "ri-user-3-line",
  "Bank accounts": "ri-bank-card-line",
  Dependents: "ri-group-2-line",
  Statements: "ri-file-list-3-line",
  Notifications: "ri-notification-3-line",
  Security: "ri-shield-check-line",
};

const Settings = () => {
  // navigate and get url path
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useUser();

  // state for tab
  const [activeTab, setActiveTab] = useState("Profile");
  // Minors don't manage dependents or their own bank accounts — neither
  // tab applies to them.
  const tabList = currentUser?.isMinor
    ? ["Profile", "Statements", "Security"]
    : ["Profile", "Bank accounts", "Dependents", "Statements", "Security"];

  // Split the pathname and filter out empty strings (like the trailing slash)
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Get the last item in the array
  const lastPath = pathSegments[pathSegments.length - 1];

  const onTabClick = (tab: string) => {
    setActiveTab(tab);

    if (tab === "Profile") {
      navigate("profile");
    } else if (tab === "Bank accounts") {
      navigate("bank-accounts");
    } else if (tab === "Dependents") {
      navigate("dependents");
    } else if (tab === "Statements") {
      navigate("statements");
    } else if (tab === "Notifications") {
      navigate("notifications");
    } else if (tab === "Security") {
      navigate("security");
    } else {
      navigate("profile");
    }
  };

  useEffect(() => {
    const refreshTabClick = () => {
      let formattedPath = ConvertToTitleCase(lastPath);
      if (lastPath === "bank-accounts") {
        formattedPath = "Bank accounts";
      }
      onTabClick(formattedPath);
    };

    refreshTabClick();
  }, [lastPath]);

  // Reserves space equal to the fixed header's real (measured) height, so
  // the outlet content underneath doesn't start out hidden beneath it —
  // measured rather than hardcoded since the tab row can wrap on narrow
  // screens. The scroll card in ProtectedRoute.tsx is given a transform so
  // this `fixed` header is scoped to it instead of the browser viewport.
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const updateHeight = () => setHeaderHeight(el.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Picks up a shadow/border once the card underneath has actually been
  // scrolled — the header sits flush with no separation at rest, and only
  // "lifts" above the content once there's something to lift above, the
  // same elevation-on-scroll pattern apps like Notion/Gmail use.
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let node: HTMLElement | null = header.parentElement;
    let scrollEl: HTMLElement | null = null;
    while (node) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) {
        scrollEl = node;
        break;
      }
      node = node.parentElement;
    }
    if (!scrollEl) return;
    const handleScroll = () => setIsScrolled(scrollEl!.scrollTop > 4);
    handleScroll();
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl!.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="settings-wrapper ">
      <div
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-20 rounded-t-[32px] bg-(--surface-default)/95 backdrop-blur-sm px-[20px] sm:px-[20px] md:px-[50px] lg:px-[50px] xl:px-[50px] pt-[24px] sm:pt-[24px] md:pt-[32px] lg:pt-[32px] xl:pt-[32px] pb-[8px] transition-shadow duration-200 ${
          isScrolled
            ? "shadow-[0_8px_20px_rgba(15,15,15,0.06)] border-b border-(--surface-sidebar)"
            : "border-b border-transparent"
        }`}
      >
        <h2 className="text-[22px] sm:text-[26px] font-bold text-(--text-content-default) tracking-[-0.5px] leading-[28px] sm:leading-[32px]">
          Settings
        </h2>

        <div className="settings-body-tab-wrapper mt-[12px] inline-flex gap-[4px] rounded-[999px] bg-[#F4F4F4] p-[4px] overflow-x-auto max-w-full">
          {tabList.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabClick(tab)}
              className={`flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[999px] px-[16px] py-[6px] text-[14px] font-semibold capitalize transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-[#00585E] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  : "text-[#8C8C8C] hover:text-(--text-content-default)"
              }`}
            >
              <i className={`${tabIcons[tab]} text-[16px] ${activeTab === tab ? "text-[#00868D]" : ""}`}></i>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: headerHeight }} aria-hidden="true" />

      <div className="settings-body-wrapper ">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;
