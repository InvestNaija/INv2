import { useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Header from "../../../components/organisms/header";
import Period from "../../../components/dialogs/transaction-period";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ConvertToTitleCase from "../../../hooks/convertToTitleCase";
import TransactionFeatures, {
  useTransactionFeatures,
  TRANSACTION_SOURCE_OPTIONS,
} from "../../../contexts/transactionContext";
import { STATUS_HEX_COLORS } from "../../../hooks/transactionHelpers";

const STATUS_OPTIONS = Object.keys(STATUS_HEX_COLORS);

// Friendly display names for the raw source codes the API uses.
const SOURCE_LABELS: Record<string, string> = {
  planin: "Plan",
  savein: "Save",
  tradein: "Trade",
  investin: "Invest",
};

// Shared look for both filter dropdowns' paper, so Modules and Status read
// as one consistent component rather than two separately-styled menus.
const FILTER_MENU_PAPER_SX = {
  borderRadius: "14px",
  border: "1px solid var(--border-default)",
  backgroundColor: "var(--surface-default)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  mt: "8px",
  minWidth: "220px",
  py: "6px",
};

// A small uppercase caption at the top of each dropdown, so it's clear at a
// glance what's being filtered without relying on the trigger button alone.
const FilterMenuHeader = ({ label }: { label: string }) => (
  <div className="px-[14px] pt-[6px] pb-[8px]">
    <span className="text-[11px] leading-[14px] tracking-[0.3px] font-bold uppercase text-(--text-content-muted)">
      {label}
    </span>
  </div>
);

// Formats a "YYYY-MM-DD" range as e.g. "Jan 1 – Jan 31" for the filter
// button's label.
const formatRangeLabel = (start: string, end: string) => {
  const format = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  return `${format(start)} – ${format(end)}`;
};

// Renders the actual page content. Split out from Transactions so it mounts
// as a child of <TransactionFeatures>, since a component can't consume a
// context provider that it itself renders further down its own JSX tree.
const TransactionsContent = () => {
  // navigate and get url path
  const navigate = useNavigate();
  const location = useLocation();

  const {
    dateRange,
    setDateRange,
    sourceFilter,
    setSourceFilter,
    statusFilter,
    setStatusFilter,
  } = useTransactionFeatures();

  // state for dialog
  const [openPeriodDialog, setPeriodDialog] = useState(false);

  // Anchors for the two filter dropdowns; null = closed.
  const [sourceAnchorEl, setSourceAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [statusAnchorEl, setStatusAnchorEl] = useState<HTMLElement | null>(
    null,
  );

  // state for tab
  const [activeTab, setActiveTab] = useState("All");
  const tabList = ["All", "Incoming", "Outgoing"];

  // Split the pathname and filter out empty strings (like the trailing slash)
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Get the last item in the array
  const lastPath = pathSegments[pathSegments.length - 1];

  const onTabClick = (tab: string) => {
    setActiveTab(tab);

    if (tab === "All") {
      navigate("all");
    } else if (tab === "Incoming") {
      navigate("incoming");
    } else if (tab === "Outgoing") {
      navigate("outgoing");
    } else {
      navigate("all");
    }
  };

  useEffect(() => {
    const refreshTabClick = () => {
      onTabClick(ConvertToTitleCase(lastPath));
    };

    refreshTabClick();
  }, [lastPath]);

  const handleDialogOpen = () => {
    setPeriodDialog(true);
  };

  const handleApplyDateRange = (startDate: string, endDate: string) => {
    setDateRange({ start: startDate, end: endDate });
  };

  const handleClearDateRange = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDateRange({ start: "", end: "" });
  };

  const handleSourceMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSourceAnchorEl(event.currentTarget);
  };

  const handleSourceMenuClose = () => {
    setSourceAnchorEl(null);
  };

  // Multi-select — checking several sources ORs them together. Always
  // leaves at least one checked: unchecking the last one would send an
  // empty `source` param, which (per this API's convention) means "no
  // filter" and would pull wallet transactions back in.
  const toggleSource = (source: string) => {
    if (sourceFilter.includes(source)) {
      if (sourceFilter.length === 1) return;
      setSourceFilter(sourceFilter.filter((item) => item !== source));
    } else {
      setSourceFilter([...sourceFilter, source]);
    }
  };

  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };

  // Single-select — picking a status closes the menu immediately.
  const handleStatusSelect = (status: string) => {
    setStatusFilter(status);
    setStatusAnchorEl(null);
  };

  const hasDateRange = Boolean(dateRange.start && dateRange.end);
  const isSourceFiltered = sourceFilter.length < TRANSACTION_SOURCE_OPTIONS.length;

  return (
    <>
      <Period
        openPeriodDialog={openPeriodDialog}
        setPeriodDialog={setPeriodDialog}
        onApply={handleApplyDateRange}
        initialStartDate={dateRange.start || undefined}
        initialEndDate={dateRange.end || undefined}
      />
      <div className="transactions-wrapper">
        <div className="header-wrapper">
          <Header></Header>
        </div>

        <div className="transactions-title-wrapper mt-[43px]">
          <div className="flex flex-col xs:flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row justify-between items-start xs:items-start sm:items-start md:items-center lg:items-center xl:items-center">
            <div>
              <h2>Transactions</h2>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full md:w-auto mt-[16px] md:mt-0">
              {/* Source filter: multi-select — checking several sources at
                  once ORs them together (e.g. "Save" + "Trade"). */}
              <button
                type="button"
                onClick={handleSourceMenuOpen}
                className={`flex items-center gap-[6px] cursor-pointer rounded-[999px] px-[12px] sm:px-[16px] py-[8px] h-[44px] sm:h-[48px] border text-[13px] sm:text-[14px] font-medium transition-colors whitespace-nowrap ${
                  isSourceFiltered
                    ? "bg-[#00585E] border-[#00585E] text-white"
                    : "border-(--border-default) text-(--text-content-default) hover:bg-(--surface-subtle)"
                }`}
              >
                <i className="ri-checkbox-multiple-line text-[18px]"></i>
                Modules
                {isSourceFiltered ? ` (${sourceFilter.length})` : ""}
              </button>
              <Menu
                anchorEl={sourceAnchorEl}
                open={Boolean(sourceAnchorEl)}
                onClose={handleSourceMenuClose}
                slotProps={{ paper: { sx: FILTER_MENU_PAPER_SX } }}
              >
                <FilterMenuHeader label="Filter by module" />
                {TRANSACTION_SOURCE_OPTIONS.map((source) => (
                  <MenuItem
                    key={source}
                    onClick={() => toggleSource(source)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      mx: "6px",
                      px: "8px",
                      py: "8px",
                      borderRadius: "10px",
                      color: "var(--text-content-default)",
                      "&:hover": { backgroundColor: "var(--surface-subtle)" },
                    }}
                  >
                    <Checkbox
                      checked={sourceFilter.includes(source)}
                      size="small"
                      disableRipple
                      sx={{
                        p: 0,
                        color: "var(--border-muted)",
                        "&.Mui-checked": { color: "#00585E" },
                      }}
                    />
                    <ListItemText
                      primary={SOURCE_LABELS[source] ?? source}
                      slotProps={{
                        primary: {
                          sx: { fontSize: "14px", fontWeight: 500 },
                        },
                      }}
                      sx={{ m: 0 }}
                    />
                  </MenuItem>
                ))}
              </Menu>

              {/* Status filter: single-select — one status at a time, or
                  "All statuses" to clear it. */}
              <button
                type="button"
                onClick={handleStatusMenuOpen}
                className={`flex items-center gap-[6px] cursor-pointer rounded-[999px] px-[12px] sm:px-[16px] py-[8px] h-[44px] sm:h-[48px] border text-[13px] sm:text-[14px] font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter !== ""
                    ? "bg-[#00585E] border-[#00585E] text-white"
                    : "border-(--border-default) text-(--text-content-default) hover:bg-(--surface-subtle)"
                }`}
              >
                <i className="ri-filter-3-line text-[18px]"></i>
                {statusFilter !== "" ? statusFilter : "Status"}
              </button>
              <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusMenuClose}
                slotProps={{ paper: { sx: FILTER_MENU_PAPER_SX } }}
              >
                <FilterMenuHeader label="Filter by status" />
                <MenuItem
                  onClick={() => handleStatusSelect("")}
                  selected={statusFilter === ""}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    mx: "6px",
                    px: "8px",
                    py: "8px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-content-default)",
                    "&:hover": { backgroundColor: "var(--surface-subtle)" },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(0, 88, 94, 0.08)",
                      color: "#00585E",
                      fontWeight: 600,
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "rgba(0, 88, 94, 0.12)",
                    },
                  }}
                >
                  <span className="flex h-[10px] w-[10px] shrink-0 items-center justify-center rounded-full border border-(--border-muted)"></span>
                  All statuses
                </MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    selected={statusFilter === status}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      mx: "6px",
                      px: "8px",
                      py: "8px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 500,
                      textTransform: "capitalize",
                      color: "var(--text-content-default)",
                      "&:hover": { backgroundColor: "var(--surface-subtle)" },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(0, 88, 94, 0.08)",
                        color: "#00585E",
                        fontWeight: 600,
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "rgba(0, 88, 94, 0.12)",
                      },
                    }}
                  >
                    <span
                      className="h-[10px] w-[10px] shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          STATUS_HEX_COLORS[status] ?? "var(--border-muted)",
                      }}
                    ></span>
                    {status}
                  </MenuItem>
                ))}
              </Menu>

              {/* Date filter: opens the period picker; shows the applied
                  range once one is set, with a clear (×) affordance. */}
              <div
                className={`flex items-center gap-[8px] cursor-pointer rounded-[999px] px-[12px] sm:px-[16px] py-[8px] h-[44px] sm:h-[48px] border text-[13px] sm:text-[14px] font-medium transition-colors whitespace-nowrap ${
                  hasDateRange
                    ? "bg-[#00585E] border-[#00585E] text-white"
                    : "border-(--border-default) text-(--text-content-default) hover:bg-(--surface-subtle)"
                }`}
                onClick={handleDialogOpen}
              >
                <i className="ri-calendar-line text-[18px]"></i>
                {hasDateRange
                  ? formatRangeLabel(dateRange.start, dateRange.end)
                  : "Date"}
                {hasDateRange && (
                  <i
                    className="ri-close-line text-[16px] hover:opacity-70"
                    onClick={handleClearDateRange}
                  ></i>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="transactions-body-wrapper mt-[48px]">
          {/* Segmented-pill tabs, matching the same teal-active style as the
              Modules/Status/Date filters and Wallet's type filter pills. */}
          <div className="transactions-body-tab-wrapper inline-flex max-w-full overflow-x-auto gap-[4px] p-[4px] rounded-[999px] bg-(--surface-subtle)">
            {tabList.map((tab) => (
              <div
                key={tab}
                className={`px-[16px] py-[8px] rounded-[999px] flex items-center justify-center cursor-pointer capitalize text-[13px] sm:text-[14px] font-semibold leading-[20px] tracking-[0.1px] whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-[#00585E] text-white"
                    : "text-(--text-content-muted) hover:text-(--text-content-default)"
                }`}
                onClick={() => onTabClick(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

const Transactions = () => (
  <TransactionFeatures>
    <TransactionsContent />
  </TransactionFeatures>
);

export default Transactions;
