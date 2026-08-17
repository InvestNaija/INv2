import type { SecurityListTableProps } from "../../features/ui/invest/trade/explore-securities/interface";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useState } from "react";
import fundLogo from "../../assets/icons/Indicator.svg";
import EmptyStateIcon from "../atoms/empty-state-icon";
import { Link, useNavigate } from "react-router-dom";
import RemoveWatchlistConfirmation from "../dialogs/remove-watchlist-confirmation";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 100];

interface Column {
  id: "securityName" | "high" | "low" | "priceChange" | "lastTrade" | "action";
  label: string;
  minWidth?: number;
  align?: "right";
  // Custom render function that returns a ReactNode
  renderCell?: (row: SecurityListTableProps) => React.ReactNode | undefined;
}

const baseColumns: readonly Column[] = [
  {
    id: "securityName",
    label: "Security",
    minWidth: 230,
    renderCell: (row) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-(--surface-subtle) overflow-hidden">
          <img
            src={row.image || fundLogo}
            className="h-full w-full object-cover"
            alt={row.securityName}
            onError={(event) => {
              event.currentTarget.src = fundLogo;
            }}
          />
        </span>
        {row.securityName}
      </Box>
    ),
  },
  {
    id: "high",
    label: "High (₦)",
    minWidth: 110,
    align: "right",
    renderCell: (row) => <Box>{row.high.toLocaleString("en-US")}</Box>,
  },
  {
    id: "low",
    label: "Low (₦)",
    minWidth: 110,
    align: "right",
    renderCell: (row) => <Box>{row.low.toLocaleString("en-US")}</Box>,
  },
  {
    id: "priceChange",
    label: "Price change",
    minWidth: 160,
    // The raw sign lives only in the formatted string (the shared
    // SecurityListTableProps interface doesn't carry a separate numeric
    // field) — a leading "-" means it fell, same red/green convention used
    // for debit/credit everywhere else in the app.
    renderCell: (row) => (
      <Box
        sx={{
          color: row.priceChange.trim().startsWith("-")
            ? "#E5333E"
            : "#44A185",
        }}
      >
        {row.priceChange}
      </Box>
    ),
  },
  {
    id: "lastTrade",
    label: "Last trade (₦)",
    minWidth: 160,
    align: "right",
    renderCell: (row) => <Box>{row.lastTrade.toLocaleString("en-US")}</Box>,
  },
];

// Builds the windowed page-number list shown in the pagination bar, e.g.
// [1, "ellipsis", 6, 7, 8, "ellipsis", 20] — always keeps the first, last,
// and a window around the current page, collapsing the rest so the bar
// doesn't stretch across the screen when there are many pages. `currentPage`
// and `totalPages` are both 1-indexed.
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

// When provided, pagination is "controlled" by the parent: it owns
// page/rowsPerPage, refetches per page from the server, and tells the table
// whether there's a next page (since the endpoint never returns a total
// count, there's no way to know exact totals or page numbers — just
// Previous/Next). When omitted, the table paginates `tableData` internally
// (client-side, numbered pages + exact "Showing X–Y of Z"), for callers that
// already have the complete dataset in memory.
interface ControlledPagination {
  page: number; // 0-indexed
  rowsPerPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

interface SecuritiesListTableProps {
  tableData: SecurityListTableProps[];
  isLoading?: boolean;
  pagination?: ControlledPagination;
  // Bookmark/watchlist wiring for the star in the action column — all
  // optional so a caller that doesn't care about watchlisting still works
  // (star just renders outlined and does nothing).
  watchlistSecIds?: string[];
  onAddBookmark?: (symbol: string) => void;
  onRemoveBookmark?: (symbol: string) => void;
  isMutatingWatchlist?: boolean;
}

// Styled to match the Transactions table (components/organisms/
// transactions-list.tsx): same card frame, header/row tokens, empty state,
// and pagination bar.
export default function SecuritiesListTable({
  tableData,
  isLoading = false,
  pagination,
  watchlistSecIds = [],
  onAddBookmark,
  onRemoveBookmark,
  isMutatingWatchlist = false,
}: SecuritiesListTableProps) {
  const navigate = useNavigate();
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);
  const [pendingRemoval, setPendingRemoval] =
    useState<SecurityListTableProps | null>(null);

  // Built per-render (not in the module-level `baseColumns`) so it can
  // close over watchlist state/handlers and the row-click-vs-star-click
  // stopPropagation logic.
  const actionColumn: Column = {
    id: "action",
    label: "",
    minWidth: 150,
    renderCell: (row) => {
      const ticker = row.secId ?? row.code;
      const isBookmarked = watchlistSecIds.includes(ticker);

      return (
        <Box>
          <div className="flex justify-between items-center">
            <Link
              to={`/app/invest/trade/details/${ticker}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="text-[#0E47D8] font-semibold text-[16px] leading-[24px] tracking-[0.2px] p-[4px] cursor-pointer">
                <span>Buy</span>
              </div>
            </Link>
            <button
              type="button"
              disabled={isMutatingWatchlist}
              aria-label={
                isBookmarked ? "Remove from watchlist" : "Add to watchlist"
              }
              onClick={(event) => {
                event.stopPropagation();
                if (isBookmarked) {
                  setPendingRemoval(row);
                } else {
                  onAddBookmark?.(ticker);
                }
              }}
              className="text-right cursor-pointer disabled:cursor-not-allowed"
            >
              <i
                className={`${isBookmarked ? "ri-star-fill text-[#E77731]" : "ri-star-line text-(--text-content-muted)"} text-[24px]`}
              ></i>
            </button>
          </div>
        </Box>
      );
    },
  };

  const columns: readonly Column[] = [...baseColumns, actionColumn];

  const page = pagination ? pagination.page : internalPage;
  const rowsPerPage = pagination ? pagination.rowsPerPage : internalRowsPerPage;

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = +event.target.value;
    if (pagination) {
      pagination.onRowsPerPageChange(value);
    } else {
      setInternalRowsPerPage(value);
      setInternalPage(0);
    }
  };

  const goToPage = (nextPage: number) => {
    if (pagination) {
      pagination.onPageChange(nextPage);
    } else {
      setInternalPage(nextPage);
    }
  };

  // In controlled mode, `tableData` is already just the current page's rows
  // (the parent fetched exactly that slice from the server) — don't re-slice
  // it. In uncontrolled mode, `tableData` is the complete dataset, so slice
  // it client-side.
  const totalItems = tableData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const rangeStart = totalItems === 0 ? 0 : page * rowsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, totalItems);
  const visibleRows = pagination
    ? tableData
    : tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const showPaginationBar = pagination
    ? !isLoading && visibleRows.length > 0
    : !isLoading && totalItems > 0;

  return (
    <>
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
        <Table
          stickyHeader
          aria-label="securities table"
          sx={{ backgroundColor: "var(--surface-default)" }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
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
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={columns.length}
                      sx={{ border: "none", p: 2 }}
                    >
                      <div className="h-10 bg-[#F0F0F0] rounded-[8px] animate-pulse w-full"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ border: "none" }}
                >
                  <div className="empty-data-wrapper">
                    <div className="flex justify-center py-[64px]">
                      <div className="empty-data-content">
                        <div className="flex justify-center">
                          <EmptyStateIcon size={64} icon="ri-line-chart-line" />
                        </div>
                        <div className="text-center mt-[12px] mb-[3px] text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                          <span>No securities to show.</span>
                        </div>
                        <div className="text-center text-(--text-content-muted) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                          <span>Check back again shortly.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, index) => (
                <TableRow
                  key={`${row.code}-${index}`}
                  onClick={() =>
                    navigate(`/app/invest/trade/details/${row.secId ?? row.code}`)
                  }
                  sx={{
                    "& td": {
                      borderBottom: "1px solid var(--border-default)",
                      cursor: "pointer",
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
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {column.renderCell
                        ? column.renderCell(row)
                        : row[column.id as keyof SecurityListTableProps]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPaginationBar && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-[24px] py-[16px] border-t border-(--border-default)">
          <div className="flex items-center gap-3 text-[13px] text-(--text-content-muted) font-medium">
            {pagination ? (
              <span>Page {page + 1}</span>
            ) : (
              <span>
                Showing {rangeStart}–{rangeEnd} of {totalItems}
              </span>
            )}
            <label className="hidden sm:flex items-center gap-[6px]">
              Rows per page
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
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
              onClick={() => goToPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-[10px] py-[6px] rounded-[8px] text-[13px] font-medium text-(--text-content-default) disabled:text-(--text-content-muted) disabled:cursor-not-allowed cursor-pointer hover:bg-(--surface-subtle)"
            >
              <i className="ri-arrow-left-s-line text-[16px]"></i>
              Previous
            </button>

            {!pagination &&
              getPageNumbers(page + 1, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-[6px] text-(--text-content-muted) text-[13px]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item - 1)}
                    className={`h-[32px] w-[32px] rounded-[8px] text-[13px] font-medium cursor-pointer transition-colors ${
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
                goToPage(
                  pagination ? page + 1 : Math.min(totalPages - 1, page + 1),
                )
              }
              disabled={pagination ? !pagination.hasMore : page + 1 >= totalPages}
              className="flex items-center gap-1 px-[10px] py-[6px] rounded-[8px] text-[13px] font-medium text-(--text-content-default) disabled:text-(--text-content-muted) disabled:cursor-not-allowed cursor-pointer hover:bg-(--surface-subtle)"
            >
              Next
              <i className="ri-arrow-right-s-line text-[16px]"></i>
            </button>
          </div>
        </div>
      )}
    </Paper>
    <RemoveWatchlistConfirmation
      open={!!pendingRemoval}
      setOpen={(open) => {
        if (!open) setPendingRemoval(null);
      }}
      onConfirm={() => {
        if (!pendingRemoval) return;
        onRemoveBookmark?.(pendingRemoval.secId ?? pendingRemoval.code);
        setPendingRemoval(null);
      }}
      isLoading={isMutatingWatchlist}
      securityName={pendingRemoval?.securityName}
    />
    </>
  );
}
