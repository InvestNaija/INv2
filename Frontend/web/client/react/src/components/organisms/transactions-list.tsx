import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
import EmptyStateIcon from "../atoms/empty-state-icon";
import { useTransactionFeatures } from "../../contexts/transactionContext";
import { useUser } from "../../contexts/userContext";
import TransactionDetails from "../dialogs/transaction-details";
import formatCurrency from "../../hooks/FormatCurrency";
import {
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
  formatTransactionDate,
  getTransactionTitle,
  isCreditLikeTransaction,
  type TransactionLike,
} from "../../hooks/transactionHelpers";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 100];

interface TransactionsListProps {
  // "" = All, "credit" = Incoming, "debit" = Outgoing.
  typeFilter?: string;
}

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

export default function TransactionsList({
  typeFilter = "",
}: TransactionsListProps) {
  const {
    transactions,
    isLoading,
    totalItems,
    totalPages,
    fetchTransactions,
    dateRange,
    sourceFilter,
    statusFilter,
  } = useTransactionFeatures();
  const { currentUser } = useUser();
  const showBalance = currentUser?.show_balance ?? true;

  // MUI's TablePagination is 0-indexed; the API is 1-indexed.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionLike | null>(null);
  const [openTransactionDetails, setOpenTransactionDetails] = useState(false);

  useEffect(() => {
    fetchTransactions({
      page: page + 1,
      size: rowsPerPage,
      type: typeFilter,
      source: sourceFilter.join(","),
      start: dateRange.start,
      end: dateRange.end,
      status: statusFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, typeFilter, sourceFilter, dateRange, statusFilter]);

  // Switching tabs, the source/date/status filters should all start back at
  // page 1, rather than staying on, say, page 3 of "All" while a narrower
  // filter shows an empty page.
  useEffect(() => {
    setPage(0);
  }, [typeFilter, sourceFilter, dateRange, statusFilter]);

  // Safety net in case the API doesn't actually filter by `status` server
  // side (unconfirmed) — guarantees the list is correct either way. When the
  // server does honor it, this is a no-op since every returned row already
  // matches.
  const visibleTransactions =
    statusFilter === ""
      ? transactions
      : transactions.filter(
          (transaction) => transaction.status.toLowerCase() === statusFilter,
        );

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = (transaction: TransactionLike) => {
    setSelectedTransaction(transaction);
    setOpenTransactionDetails(true);
  };

  const rangeStart = totalItems === 0 ? 0 : page * rowsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, totalItems);

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
      <TransactionDetails
        openDialog={openTransactionDetails}
        setDialog={setOpenTransactionDetails}
        transaction={selectedTransaction}
      />
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table
          stickyHeader
          aria-label="transactions table"
          sx={{ backgroundColor: "var(--surface-default)" }}
        >
          <TableHead>
            <TableRow>
              {[
                { label: "Description", minWidth: 220 },
                { label: "Type", minWidth: 100 },
                { label: "Amount (₦)", minWidth: 150, align: "right" as const },
                { label: "Status", minWidth: 130 },
                { label: "Date", minWidth: 170 },
              ].map((column) => (
                <TableCell
                  key={column.label}
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
                    <TableCell colSpan={5} sx={{ border: "none", p: 2 }}>
                      <div className="h-10 bg-[#F0F0F0] rounded-[8px] animate-pulse w-full"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : visibleTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ border: "none" }}>
                  <div className="empty-data-wrapper">
                    <div className="flex justify-center py-[64px]">
                      <div className="empty-data-content">
                        <div className="flex justify-center">
                          <EmptyStateIcon size={64} icon="ri-exchange-line" />
                        </div>
                        <div className="text-center mt-[12px] mb-[3px] text-(--text-content-default) text-[14px] leading-[20px] tracking-[0.1px] font-semibold">
                          <span>No transactions yet.</span>
                        </div>
                        <div className="text-center text-(--text-content-muted) text-[14px] leading-[20px] tracking-[0.1px] font-medium">
                          <span>Your transactions will appear here.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visibleTransactions.map((transaction) => {
                const isCredit = isCreditLikeTransaction(transaction);
                const statusColor =
                  STATUS_STYLES[transaction.status?.toLowerCase()] ??
                  DEFAULT_STATUS_STYLE;

                return (
                  <TableRow
                    key={transaction.id}
                    onClick={() => handleRowClick(transaction)}
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
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <span className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${isCredit ? "bg-[#E6F4EA]" : "bg-[#FCE8E6]"}`}>
                          <i
                            className={
                              isCredit
                                ? "ri-arrow-right-down-line text-[20px] text-[#0D904F]"
                                : "ri-arrow-right-up-line text-[20px] text-[#D93025]"
                            }
                          ></i>
                        </span>
                        {getTransactionTitle(transaction.description)}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {transaction.type}
                    </TableCell>
                    <TableCell align="right">
                      {showBalance
                        ? formatCurrency(transaction.amount, transaction.currency)
                        : "₦••••"}
                    </TableCell>
                    <TableCell>
                      <div
                        className="inline-flex items-center justify-center rounded-[6px] px-[10px] py-[3px] text-[12px] font-bold capitalize"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.text}` }}
                      >
                        {transaction.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatTransactionDate(transaction.post_date)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Custom pagination: unlike Wallet's transaction list (whose endpoint
          doesn't return a total count, so it can only guess at "more
          pages"), this endpoint returns totalItems/totalPages — so this bar
          shows an exact "Showing X–Y of Z" range and real page numbers
          instead of just Previous/Next. */}
      {!isLoading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-[24px] py-[16px] border-t border-(--border-default)">
          <div className="flex items-center gap-3 text-[13px] text-(--text-content-muted) font-medium">
            <span>
              Showing {rangeStart}–{rangeEnd} of {totalItems}
            </span>
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
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-[10px] py-[6px] rounded-[8px] text-[13px] font-medium text-(--text-content-default) disabled:text-(--text-content-muted) disabled:cursor-not-allowed cursor-pointer hover:bg-(--surface-subtle)"
            >
              <i className="ri-arrow-left-s-line text-[16px]"></i>
              Previous
            </button>

            {getPageNumbers(page + 1, totalPages).map((item, index) =>
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
                  onClick={() => setPage(item - 1)}
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
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={page + 1 >= totalPages}
              className="flex items-center gap-1 px-[10px] py-[6px] rounded-[8px] text-[13px] font-medium text-(--text-content-default) disabled:text-(--text-content-muted) disabled:cursor-not-allowed cursor-pointer hover:bg-(--surface-subtle)"
            >
              Next
              <i className="ri-arrow-right-s-line text-[16px]"></i>
            </button>
          </div>
        </div>
      )}
    </Paper>
  );
}
