import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import Back from "../../../../components/molecules/back";
import AssetIcon from "../../../../assets/icons/saveplan.svg";
import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@mui/material";
import SaveDetails from "../../../../components/dialogs/save-details";
import AccountVerification from "../../../../components/dialogs/account-verification";
import AdditionalKyc from "../../../../components/dialogs/additional-kyc";
import isKycComplete from "../../../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../../../hooks/isAdditionalKycComplete";
import TransactionDetails from "../../../../components/dialogs/transaction-details";
import { useSave } from "../../../../contexts/saveContext";
import type { SavePlan } from "../../../../models/savePlanModel";
import formatCurrency from "../../../../hooks/FormatCurrency";
import fundLogo from "../../../../assets/icons/saveplan.svg";
import { useUser } from "../../../../contexts/userContext";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
};

const UserSaveBreakdown = () => {
  const { currentUser } = useUser();
  const { fetchPlaninList, fetchSaveinList, fetchOngoingPlanin, fetchOngoingSavein, fetchPlanTransactions } = useSave();
  const showBalance = currentUser?.show_balance ?? true;
  const [openSaveDetailsDialog, setSaveDetailsDialog] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanLogo, setActivePlanLogo] = useState<string | null>(null);
  const [ongoingPlans, setOngoingPlans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTxLoading, setIsTxLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [openTransactionDetails, setOpenTransactionDetails] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const [planinRes, saveinRes, ongoingPlaninRes, ongoingSaveinRes] = await Promise.allSettled([
          fetchPlaninList(),
          fetchSaveinList(),
          fetchOngoingPlanin(),
          fetchOngoingSavein()
        ]);
        if (isMounted) {
            let combined: SavePlan[] = [];
            if (planinRes.status === "fulfilled" && planinRes.value.success) {
              combined = [...combined, ...planinRes.value.data.rows];
            }
            if (saveinRes.status === "fulfilled" && saveinRes.value.success) {
              combined = [...combined, ...saveinRes.value.data.rows];
            }
            
            let ongoing: any[] = [];
            if (ongoingPlaninRes.status === "fulfilled" && ongoingPlaninRes.value.success) {
                ongoing = [...ongoing, ...ongoingPlaninRes.value.data];
            }
            if (ongoingSaveinRes.status === "fulfilled" && ongoingSaveinRes.value.success) {
                ongoing = [...ongoing, ...ongoingSaveinRes.value.data];
            }

            // Map master image to the ongoing plans
            ongoing = ongoing.map(p => {
              const matchedMaster = combined.find(c => c.id === p.saveplan_id || c.title?.toLowerCase() === p.title?.toLowerCase());
              return {
                ...p,
                master_image: matchedMaster?.logo || matchedMaster?.icon || null
              };
            });

            setOngoingPlans(ongoing);
            
            // Fetch transactions for ongoing plans
            try {
              setIsTxLoading(true);
              const txPromises = ongoing.map(p => 
                fetchPlanTransactions(p.id, 1, 100).then(res => ({ plan: p, res }))
              );
              const txResults = await Promise.allSettled(txPromises);
              let allTxs: any[] = [];
              
              txResults.forEach(result => {
                if (result.status === "fulfilled" && result.value.res?.data?.rows) {
                  const rowsWithPlan = result.value.res.data.rows.map((row: any) => ({
                    ...row,
                    currency: row.currency || result.value.plan.currency || "NGN",
                    planTitle: result.value.plan.title || result.value.plan.saveplan?.title || "Savings Plan"
                  }));
                  allTxs = [...allTxs, ...rowsWithPlan];
                }
              });
              
              // Sort by created_at descending
              allTxs.sort((a, b) => {
                const dateA = a.created_at || a.createdAt || a.date;
                const dateB = b.created_at || b.createdAt || b.date;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              });
              
              setTransactions(allTxs);
            } catch (error) {
              console.error("Failed to fetch transactions", error);
            } finally {
              setIsTxLoading(false);
            }
        }
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPlans();
    return () => { isMounted = false; };
  }, []);

  const calculateNextBillingDate = (startDateStr?: string, frequency?: string) => {
    if (!startDateStr || !frequency) return "N/A";
    const start = dayjs(startDateStr);
    const now = dayjs();
    let nextDate = start;

    while (nextDate.isBefore(now) || nextDate.isSame(now, 'day')) {
      switch (frequency.toLowerCase()) {
        case 'daily':
          nextDate = nextDate.add(1, 'day');
          break;
        case 'weekly':
          nextDate = nextDate.add(1, 'week');
          break;
        case 'monthly':
          nextDate = nextDate.add(1, 'month');
          break;
        case 'quarterly':
          nextDate = nextDate.add(3, 'month');
          break;
        case 'annually':
        case 'yearly':
          nextDate = nextDate.add(1, 'year');
          break;
        default:
          return "N/A"; // Unknown frequency
      }
    }
    return nextDate.format("DD MMM, YYYY");
  };

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += offset;
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;

  };

  const handleSaveDialogOpen = (planId: string, logo: string) => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    setActivePlanId(planId);
    setActivePlanLogo(logo);
    setSaveDetailsDialog(true);
  };

  return (
    <>
      <SaveDetails
        openSaveDetailsDialog={openSaveDetailsDialog}
        setSaveDetailsDialog={setSaveDetailsDialog}
        activePlanId={activePlanId}
        activePlanLogo={activePlanLogo}
      ></SaveDetails>
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKyc}
        setAdditionalKycDialog={setOpenAdditionalKyc}
      />
      <div className="my-assets-wrapper mt-[46px]">
        <div className="flex flex-start py-[20px]">
          <Back name="Back" />
        </div>

        <div className="@container w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-[24px]">
          <div className="my-stocks-content-wrapper">
            <div className="">
              <h6 className="text-[28px] leading-[40px] font-bold text-[#0F0F0F] tracking-[-0.3]">
                My plans
              </h6>
            </div>

            <div className="mt-[25px]">
              <div className="flex items-center">
                {/* <button onClick={() => scroll(-200)}>Left</button> */}
                <div
                  ref={scrollRef}
                  style={{
                    display: "flex",
                    overflowX: "scroll",
                    scrollBehavior: "smooth",
                  }}
                  onScroll={handleScroll}
                  className="gap-4"
                >
                  {/* Your Cards */}

                  {isLoading ? (
                    <div className="animate-pulse flex gap-4 overflow-x-hidden">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[200px] w-[264px] shrink-0 bg-[#F0F0F0] rounded-[12px]"></div>
                      ))}
                    </div>
                  ) : ongoingPlans.length === 0 ? (
                    <div className="py-6 px-4 text-sm text-[#A0A0A0]">
                      No ongoing plans yet.
                    </div>
                  ) : (
                    ongoingPlans.map((plan, idx) => (
                      <div
                        key={idx}
                        className="relative bg-white border border-[#F4F4F4] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(231,119,49,0.12)] rounded-[24px] cursor-pointer shrink-0 transition-all duration-500 hover:-translate-y-2 group overflow-hidden"
                        onClick={() => handleSaveDialogOpen(
                          plan.saveplan_user?.id || plan.id, 
                          plan.master_image || plan.saveplan?.logo || plan.saveplan?.icon || plan.logo || plan.icon || fundLogo
                        )}
                      >
                        {/* Modern decorative header gradient */}
                        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-br from-[#FFF0E6] via-[#FFF5EF] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-[-20px] right-[-20px] w-[120px] h-[120px] bg-[#E77731] opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity duration-500"></div>

                        <div className="!w-[250px] flex flex-col h-full relative z-10 p-[24px]">
                          <div className="flex justify-between items-start">
                            <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[18px] bg-white border border-[#FFE4D6] shadow-[0_4px_16px_rgba(231,119,49,0.08)] overflow-hidden p-[4px] group-hover:scale-105 transition-transform duration-500">
                              <img
                                src={plan.master_image || plan.saveplan?.logo || plan.saveplan?.icon || plan.logo || plan.icon || fundLogo}
                                alt="Asset Icon"
                                className="w-full h-full object-contain rounded-[14px]"
                                onError={(e) => {
                                  e.currentTarget.src = fundLogo;
                                }}
                              />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0">
                              <i className="ri-arrow-right-up-line text-[#E77731] text-[16px]"></i>
                            </div>
                          </div>
                          
                          <div className="mt-[28px] flex flex-col flex-1">
                            <span className="text-[12px] text-[#A0A0A0] font-bold leading-[16px] tracking-[0.5px] uppercase mb-[4px]">
                              {plan.title || plan.saveplan?.title || "Savings Plan"}
                            </span>
                            <span className="text-[26px] text-[#111111] font-black leading-[32px] tracking-[-0.5px] group-hover:text-[#E77731] transition-colors duration-500">
                              {showBalance ? formatCurrency(Number(plan.total_paid || 0), "NGN") : "₦••••"}
                            </span>
                            <span className="text-[13px] text-[#888888] font-medium leading-[18px] mt-[4px]">
                              Total Saved
                            </span>
                          </div>
                          
                          <div className="mt-[28px] pt-[20px] border-t border-[#F4F4F4] flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-[#A0A0A0] font-semibold text-[10px] uppercase tracking-[0.8px]">Next billing</span>
                              <span className="text-[#111111] text-[13px] leading-[18px] tracking-[0.1px] font-bold mt-[4px]">
                                {calculateNextBillingDate(plan.start_date, plan.frequency)}
                              </span>
                            </div>
                            <div className="w-[36px] h-[36px] rounded-full bg-[#F9F9F9] flex items-center justify-center border border-[#F0F0F0] group-hover:bg-[#FFF0E6] group-hover:border-[#FFE4D6] transition-colors duration-500">
                              <i className="ri-calendar-event-line text-[#888888] text-[16px] group-hover:text-[#E77731] transition-colors duration-500"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <div
                    onClick={() => scroll(200)}
                    className="cursor-pointer flex h-[32px] w-[32px] items-center justify-center rounded-[999px] bg-[#EEE]"
                  >
                    <i className="ri-arrow-right-s-line text-[24px] text-(--text-content-subtle)"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[48px]">
            <div>
              <h6 className="text-[16px] leading-[24px] font-bold text-[#0F0F0F] ">
                Transactions
              </h6>
            </div>

            <div>
              <div className="mt-[12px] w-full">
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
                    <Table stickyHeader aria-label="transactions table" sx={{ backgroundColor: "var(--surface-default)" }}>
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
                        {isTxLoading ? (
                          <>
                            {[1, 2, 3].map((i) => (
                              <TableRow key={i}>
                                <TableCell colSpan={5} sx={{ border: "none", p: 2 }}>
                                  <div className="h-10 bg-[#F0F0F0] rounded-[8px] animate-pulse w-full"></div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        ) : transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ border: "none" }}>
                              <div className="flex flex-col items-center justify-center py-[60px] text-center">
                                <div className="flex items-center justify-center w-[80px] h-[80px] bg-[#F8FAFC] rounded-full mb-4">
                                  <i className="ri-history-line text-[32px] text-[#8C98A4]"></i>
                                </div>
                                <h3 className="text-[18px] font-bold text-[#1D2B36] mb-2">No Transactions Yet</h3>
                                <p className="text-[15px] text-[#8C98A4] max-w-sm">
                                  You do not have any transactions for this plan yet.
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentTransactions.map((tx, idx) => {
                            const isCredit = tx.type?.toLowerCase() === 'credit';
                            const statusKey = tx.status?.toLowerCase() || 'pending';
                            const STATUS_HEX_COLORS: Record<string, { bg: string; text: string }> = {
                              successful: { bg: "#EAF7EF", text: "#2DB260" },
                              success: { bg: "#EAF7EF", text: "#2DB260" },
                              failed: { bg: "#FEECEB", text: "#E53E3E" },
                              pending: { bg: "#FFF0E6", text: "#E77731" }
                            };
                            const statusColor = STATUS_HEX_COLORS[statusKey] || { bg: "#FFF0E6", text: "#E77731" };

                            return (
                              <TableRow
                                key={idx}
                                onClick={() => {
                                  setSelectedTransaction(tx);
                                  setOpenTransactionDetails(true);
                                }}
                                sx={{
                                  cursor: "pointer",
                                  "&:hover": { backgroundColor: "var(--surface-hover)" },
                                  "& td": {
                                    borderBottom: "1px solid var(--border-default)",
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
                                      <i className={isCredit ? "ri-arrow-left-down-line text-[18px] text-[#44A185]" : "ri-arrow-right-up-line text-[18px] text-[#E5333E]"} />
                                    </span>
                                    <Box>
                                      <div className="text-[14px] font-semibold text-[#1D2B36] line-clamp-1 max-w-[200px]">
                                        {tx.planTitle || tx.transaction_ref || tx.type || "Deposit"}
                                      </div>
                                      <div className="text-[12px] text-[#8C98A4] mt-0.5 max-w-[200px] truncate">
                                        {tx.description}
                                      </div>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <span className={`text-[14px] capitalize ${isCredit ? 'text-[#44A185]' : 'text-[#E5333E]'}`}>{tx.type || "Deposit"}</span>
                                </TableCell>
                                <TableCell align="right">
                                  <span className="text-[14px] font-bold text-[#1D2B36]">
                                    {showBalance ? formatCurrency(Number(tx.amount || 0), "NGN") : "₦••••"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div
                                    className="inline-flex items-center justify-center rounded-[6px] px-[10px] py-[3px]"
                                    style={{ backgroundColor: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.text}` }}
                                  >
                                    <span className="text-[12px] font-bold uppercase tracking-wider">{tx.status || "Completed"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-[14px] text-[#1D2B36] whitespace-nowrap">{dayjs(tx.created_at || tx.createdAt || tx.date).format("MMM D, YYYY")}</span>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {!isTxLoading && (transactions.length > 0 || currentPage > 1) && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--border-default)] px-[24px] py-[16px]">
                      <div className="flex items-center gap-3 text-[13px] text-[var(--text-content-muted)] font-medium">
                        <span>
                          Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                        </span>
                        <label className="hidden sm:flex items-center gap-[6px]">
                          Rows per page
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="rounded-[6px] border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-content-default)] text-[13px] px-[6px] py-[2px] cursor-pointer"
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
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="flex cursor-pointer items-center gap-1 rounded-[8px] px-[10px] py-[6px] text-[13px] font-medium text-[var(--text-content-default)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:text-[var(--text-content-muted)]"
                        >
                          <i className="ri-arrow-left-s-line text-[16px]"></i>
                          Previous
                        </button>

                        {getPageNumbers(currentPage, totalPages).map((item, index) =>
                          item === "ellipsis" ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-[6px] text-[13px] text-[var(--text-content-muted)]"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setCurrentPage(item as number)}
                              className={`h-[32px] w-[32px] cursor-pointer rounded-[8px] text-[13px] font-medium transition-colors ${
                                item === currentPage
                                  ? "bg-[#E77731] text-white"
                                  : "text-[var(--text-content-default)] hover:bg-[var(--surface-subtle)]"
                              }`}
                            >
                              {item}
                            </button>
                          ),
                        )}

                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage >= totalPages}
                          className="flex cursor-pointer items-center gap-1 rounded-[8px] px-[10px] py-[6px] text-[13px] font-medium text-[var(--text-content-default)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:text-[var(--text-content-muted)]"
                        >
                          Next
                          <i className="ri-arrow-right-s-line text-[16px]"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </Paper>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TransactionDetails
        openDialog={openTransactionDetails}
        setDialog={setOpenTransactionDetails}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default UserSaveBreakdown;
