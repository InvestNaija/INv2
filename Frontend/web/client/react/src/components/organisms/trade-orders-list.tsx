import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import EmptyStateIcon from "../atoms/empty-state-icon";
import { useTrade } from "../../contexts/tradeContext";
import type { TradeOrder } from "../../models/tradeModel";
import type { Portfolio } from "../../models/portfolioModel";
import CancelTradeOrderConfirmation from "../dialogs/cancel-trade-order-confirmation";

const TABS = ["All", "Buy Orders", "Sell Orders"] as const;
type Tab = (typeof TABS)[number];

// From the order-status select's real option list — PENDING is excluded
// there (commented out), so it's excluded here too.
const STATUS_OPTIONS = [
  "BOOKED",
  "EXECUTING",
  "EXECUTED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  booked: { bg: "#E9F3FB", text: "#2693E1" },
  executing: { bg: "#FDF3E7", text: "#E77731" },
  executed: { bg: "#E7F5EE", text: "#44A185" },
  cancelled: { bg: "#F5F5F5", text: "#5A5A5A" },
  rejected: { bg: "#FDEAEC", text: "#E5333E" },
  expired: { bg: "#F5F5F5", text: "#5A5A5A" },
};

// A trade can only be cancelled while it hasn't finished processing yet.
const CANCELLABLE_STATUSES = ["BOOKED", "EXECUTING"];

const DATE_PRESETS = [
  { label: "Today", getRange: (): [Dayjs, Dayjs] => [dayjs(), dayjs()] },
  {
    label: "Last 7 days",
    getRange: (): [Dayjs, Dayjs] => [dayjs().subtract(6, "day"), dayjs()],
  },
  {
    label: "Last 30 days",
    getRange: (): [Dayjs, Dayjs] => [dayjs().subtract(29, "day"), dayjs()],
  },
  {
    label: "This month",
    getRange: (): [Dayjs, Dayjs] => [dayjs().startOf("month"), dayjs()],
  },
] as const;

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];
const HISTORY_PAGE_SIZE = 100;

import { formatTransactionDate as formatOrderDate } from "../../hooks/transactionHelpers";

// Builds the windowed page-number list for the pagination bar — same
// approach as components/organisms/transactions-list.tsx, duplicated here
// since that one pulls its page/filter state from a different context.
const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (currentPage > 4) pages.push("ellipsis");
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  if (currentPage < totalPages - 3) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
};

interface TradeOrdersListProps {
  portfolio: Portfolio | null;
}

const TradeOrdersList = ({ portfolio }: TradeOrdersListProps) => {
  const { fetchTradeOrderHistory, cancelOrder } = useTrade();
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [activeTab, setActiveTab] = useState<Tab>("All");

  // Fades hint that the tab pill scrolls horizontally if it ever doesn't
  // fit — shown only on the side there's actually more to scroll to.
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

  const [statusFilter, setStatusFilter] = useState("");
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [page, setPage] = useState(0);

  const [orderToCancel, setOrderToCancel] = useState<TradeOrder | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Confirmed query param names/format for the date filter — sent to the
  // server rather than (only) filtered client-side.
  const startDateParam = startDate ? startDate.format("YYYY-MM-DD") : undefined;
  const endDateParam = endDate ? endDate.format("YYYY-MM-DD") : undefined;

  const fetchOrders = async () => {
    if (!portfolio) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetchTradeOrderHistory(
        {
          page: 0,
          size: HISTORY_PAGE_SIZE,
          portfolioId: portfolio.portfolioId,
          startDate: startDateParam,
          endDate: endDateParam,
        },
        portfolio.signature,
      );
      setOrders(response.data.results);
    } catch (error) {
      setIsError(true);
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ??
            error.response?.data?.message ??
            error.message)
        : "Failed to load trade orders";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyed on accountNo, not portfolioId — portfolioId is an opaque token
  // that rotates every time the balance card's detail refresh completes
  // (see hooks/portfolioHelpers.ts), so depending on it here fires this
  // effect twice: once for the initial list-derived portfolio, again the
  // moment the refresh swaps in a newly-rotated id. accountNo is one of the
  // fields that refresh deliberately leaves untouched, so it only changes
  // when the user actually switches to a different portfolio. Also
  // refetches whenever the date range changes, since that's now sent to
  // the server.
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio?.accountNo, startDateParam, endDateParam]);

  useEffect(() => {
    setPage(0);
  }, [activeTab, statusFilter, startDate, endDate]);

  // Server-side filtering by type/status/date isn't confirmed for this
  // endpoint (only page/size/portfolioId are) — filtered client-side over
  // the fetched page instead, same defensive approach as the wallet
  // transactions list uses for its own unconfirmed status filter.
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "Buy Orders" && order.orderType !== "BUY") return false;
    if (activeTab === "Sell Orders" && order.orderType !== "SELL")
      return false;
    if (statusFilter && order.orderStatus !== statusFilter) return false;
    if (startDate && dayjs(order.orderDate).isBefore(startDate, "day"))
      return false;
    if (endDate && dayjs(order.orderDate).isAfter(endDate, "day"))
      return false;
    return true;
  });

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const visibleOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const rangeStart = totalItems === 0 ? 0 : page * rowsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, totalItems);

  const handlePresetClick = (preset: (typeof DATE_PRESETS)[number]) => {
    const [start, end] = preset.getRange();
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset.label);
  };

  const handleStartDateChange = (value: Dayjs | null) => {
    setStartDate(value);
    setActivePreset(null);
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    setEndDate(value);
    setActivePreset(null);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || !portfolio) return;
    setIsCancelling(true);
    try {
      await cancelOrder({ id: orderToCancel.id }, portfolio.signature);
      toast.success("Trade order cancelled");
      setOrderToCancel(null);
      fetchOrders();
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ??
            error.response?.data?.message ??
            error.message)
        : "Failed to cancel trade order";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
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
      <CancelTradeOrderConfirmation
        open={!!orderToCancel}
        setOpen={(open) => !open && setOrderToCancel(null)}
        orderLabel={orderToCancel?.label}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
      />

      {/* Tabs + filters, side by side with space between them */}
      <div className="flex flex-wrap items-center justify-between gap-[12px] px-[16px] py-[16px] sm:px-[24px] sm:py-[20px]">
        <div className="relative max-w-full">
          <div
            ref={tabScrollRef}
            onScroll={updateTabScrollFades}
            className="inline-flex max-w-full gap-[4px] overflow-x-auto rounded-[32px] bg-[#F5F5F5] p-[4px]"
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-[99px] px-[16px] py-[8px] text-[13px] font-semibold transition-colors active:scale-[0.97] ${
                  activeTab === tab
                    ? "bg-white text-(--text-content-default) shadow-[0_1px_4px_rgba(15,15,15,0.1)]"
                    : "text-(--text-content-muted)"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            aria-hidden
            className={`pointer-events-none absolute left-0 top-0 h-full w-[20px] bg-gradient-to-r from-(--surface-default) to-transparent transition-opacity duration-200 sm:hidden ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute right-0 top-0 h-full w-[20px] bg-gradient-to-l from-(--surface-default) to-transparent transition-opacity duration-200 sm:hidden ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
        <button
          type="button"
          onClick={(event) => setStatusMenuAnchor(event.currentTarget)}
          className={`flex items-center gap-[6px] rounded-[99px] px-[14px] py-[8px] text-[13px] font-semibold cursor-pointer transition-colors ${
            statusFilter
              ? "bg-[#00585E] text-white"
              : "bg-(--surface-subtle) text-(--text-content-default) border border-(--border-default)"
          }`}
        >
          <i className="ri-filter-3-line text-[14px]"></i>
          {statusFilter
            ? statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()
            : "Status"}
        </button>
        <Menu
          anchorEl={statusMenuAnchor}
          open={!!statusMenuAnchor}
          onClose={() => setStatusMenuAnchor(null)}
          slotProps={{
            paper: { sx: { borderRadius: "12px", minWidth: "180px" } },
          }}
        >
          <MenuItem
            selected={statusFilter === ""}
            onClick={() => {
              setStatusFilter("");
              setStatusMenuAnchor(null);
            }}
          >
            All statuses
          </MenuItem>
          {STATUS_OPTIONS.map((status) => {
            const style = STATUS_STYLES[status.toLowerCase()];
            return (
              <MenuItem
                key={status}
                selected={statusFilter === status}
                onClick={() => {
                  setStatusFilter(status);
                  setStatusMenuAnchor(null);
                }}
              >
                <span
                  className="mr-[8px] inline-block h-[8px] w-[8px] rounded-full"
                  style={{ backgroundColor: style?.text ?? "#BFBFBF" }}
                ></span>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </MenuItem>
            );
          })}
        </Menu>

        <button
          type="button"
          onClick={() => setShowDateFilter((prev) => !prev)}
          className={`flex items-center gap-[6px] rounded-[99px] px-[14px] py-[8px] text-[13px] font-semibold cursor-pointer transition-colors ${
            showDateFilter || startDate || endDate
              ? "bg-[#00585E] text-white"
              : "bg-(--surface-subtle) text-(--text-content-default) border border-(--border-default)"
          }`}
        >
          <i className="ri-calendar-line text-[14px]"></i>
          {startDate && endDate
            ? `${startDate.format("MMM D")} - ${endDate.format("MMM D")}`
            : "Date range"}
        </button>
        </div>
      </div>

      {showDateFilter && (
        <div className="mx-[16px] mb-[16px] flex flex-col gap-[16px] rounded-[20px] border border-[#B3EBED] bg-[#F5FBFB] p-[16px] sm:mx-[24px]">
          <div className="flex flex-wrap gap-[8px]">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`cursor-pointer rounded-[99px] px-[12px] py-[6px] text-[12px] font-semibold transition-colors ${
                  activePreset === preset.label
                    ? "bg-[#00585E] text-white"
                    : "border border-[#B3EBED] bg-white text-(--text-content-default)"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-[10px] rounded-[12px] border border-[#B3EBED] bg-white/70 p-[12px]">
            <span className="px-[14px] text-[11px] font-bold uppercase tracking-[0.3px] text-[#00585E]">
              Custom range
            </span>
            <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={startDate}
                  onChange={handleStartDateChange}
                  maxDate={endDate ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        minWidth: { xs: "100%", sm: "180px" },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          background: "#fff",
                        },
                        "& .MuiOutlinedInput-root fieldset": {
                          borderColor: "#B3EBED",
                        },
                        "& .MuiOutlinedInput-root:hover fieldset": {
                          borderColor: "#26C8D1",
                        },
                        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                          borderColor: "#00585E",
                        },
                      },
                    },
                    field: { clearable: true },
                  }}
                />
                <i className="ri-arrow-right-line hidden text-[16px] text-(--text-content-muted) sm:block"></i>
                <DatePicker
                  label="To"
                  value={endDate}
                  onChange={handleEndDateChange}
                  minDate={startDate ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        minWidth: { xs: "100%", sm: "180px" },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          background: "#fff",
                        },
                        "& .MuiOutlinedInput-root fieldset": {
                          borderColor: "#B3EBED",
                        },
                        "& .MuiOutlinedInput-root:hover fieldset": {
                          borderColor: "#26C8D1",
                        },
                        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                          borderColor: "#00585E",
                        },
                      },
                    },
                    field: { clearable: true },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>
      )}

      <Divider />

      <TableContainer>
        <Table aria-label="trade orders table">
          <TableHead>
            <TableRow>
              {[
                { label: "Order", minWidth: 260 },
                { label: "Date", minWidth: 140 },
                { label: "Units", minWidth: 100, align: "right" as const },
                { label: "Status", minWidth: 130 },
                { label: "", minWidth: 110 },
              ].map((column) => (
                <TableCell
                  key={column.label}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    background: "var(--surface-sidebar)",
                    padding: "20px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    color: "var(--text-content-default)",
                    border: "none",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} sx={{ border: "none", p: 2 }}>
                      <div className="h-10 bg-[#F0F0F0] rounded-[8px] animate-pulse w-full"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ border: "none" }}>
                  <div className="flex flex-col items-center py-[48px]">
                    <p className="text-[14px] font-semibold text-(--text-content-default)">
                      Unable to load your trade orders.
                    </p>
                    <button
                      type="button"
                      onClick={fetchOrders}
                      className="mt-[8px] cursor-pointer text-[13px] font-semibold text-[#CC1A30] underline"
                    >
                      Try again
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : visibleOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ border: "none" }}>
                  <div className="flex flex-col items-center py-[64px]">
                    <EmptyStateIcon size={64} icon="ri-file-list-3-line" />
                    <p className="mt-[12px] text-[14px] font-semibold text-(--text-content-default)">
                      No trade orders yet.
                    </p>
                    <p className="text-[14px] font-medium text-(--text-content-muted)">
                      Your buy and sell orders will appear here.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visibleOrders.map((order) => {
                const isBuy = order.orderType === "BUY";
                const statusStyle =
                  STATUS_STYLES[order.orderStatus.toLowerCase()] ?? {
                    bg: "#F5F5F5",
                    text: "#5A5A5A",
                  };
                const canCancel = CANCELLABLE_STATUSES.includes(
                  order.orderStatus,
                );

                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      "& td": {
                        borderBottom: "1px solid var(--border-default)",
                        padding: "16px 24px",
                        color: "var(--text-content-default)",
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <span className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${isBuy ? "bg-[#E6F4EA]" : "bg-[#FCE8E6]"}`}>
                          <i
                            className={
                              isBuy
                                ? "ri-arrow-left-down-line text-[18px] text-[#44A185]"
                                : "ri-arrow-right-up-line text-[18px] text-[#E5333E]"
                            }
                          ></i>
                        </span>
                        <span className="text-[14px] font-medium">
                          {order.label}
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <span className="text-[14px] text-(--text-content-default) font-semibold">
                        {formatOrderDate(order.orderDate)}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-[14px] font-semibold">
                        {order.quantityRequested.toLocaleString("en-US")} unit
                        {order.quantityRequested === 1 ? "" : "s"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-block rounded-[6px] px-[10px] py-[3px] text-[12px] font-semibold capitalize"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.text}`,
                        }}
                      >
                        {order.orderStatus.charAt(0) +
                          order.orderStatus.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setOrderToCancel(order)}
                          className="flex cursor-pointer items-center gap-[4px] rounded-[99px] px-[10px] py-[6px] text-[12px] font-semibold text-[#CC1A30] hover:bg-[#FDEAEC]"
                        >
                          <i className="ri-close-circle-line text-[15px]"></i>
                          Cancel
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!isLoading && !isError && totalItems > 0 && (
        <div className="flex flex-col gap-3 border-t border-(--border-default) px-[24px] py-[16px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-[13px] text-(--text-content-muted) font-medium">
            <span>
              Showing {rangeStart}–{rangeEnd} of {totalItems}
            </span>
            <label className="hidden sm:flex items-center gap-[6px]">
              Rows per page
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-[6px] border border-(--border-default) bg-(--surface-default) text-(--text-content-default) text-[13px] px-[6px] py-[2px] cursor-pointer"
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
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="flex cursor-pointer items-center gap-1 rounded-[8px] px-[10px] py-[6px] text-[13px] font-medium text-(--text-content-default) hover:bg-(--surface-subtle) disabled:cursor-not-allowed disabled:text-(--text-content-muted)"
            >
              <i className="ri-arrow-left-s-line text-[16px]"></i>
              Previous
            </button>

            {getPageNumbers(page + 1, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-[6px] text-[13px] text-(--text-content-muted)"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item - 1)}
                  className={`h-[32px] w-[32px] cursor-pointer rounded-[8px] text-[13px] font-medium transition-colors ${
                    item === page + 1
                      ? "bg-[#00585E] text-white"
                      : "text-(--text-content-default) hover:bg-(--surface-subtle)"
                  }`}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={page + 1 >= totalPages}
              className="flex cursor-pointer items-center gap-1 rounded-[8px] px-[10px] py-[6px] text-[13px] font-medium text-(--text-content-default) hover:bg-(--surface-subtle) disabled:cursor-not-allowed disabled:text-(--text-content-muted)"
            >
              Next
              <i className="ri-arrow-right-s-line text-[16px]"></i>
            </button>
          </div>
        </div>
      )}
    </Paper>
  );
};

export default TradeOrdersList;
