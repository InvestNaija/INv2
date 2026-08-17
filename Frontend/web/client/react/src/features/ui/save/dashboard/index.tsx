import { Divider } from "@mui/material";
import fundLogo from "../../../../assets/icons/saveplan.svg";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import SaveList from "../save-list";
import type { SavePlanListCardProps } from "../save-list/interface";
import SaveDetails from "../../../../components/dialogs/save-details";
import AdditionalKyc from "../../../../components/dialogs/additional-kyc";
import AccountVerification from "../../../../components/dialogs/account-verification";

import { useState, useEffect, useCallback } from "react";
import { useSave } from "../../../../contexts/saveContext";
import formatCurrency from "../../../../hooks/FormatCurrency";
import { useUser } from "../../../../contexts/userContext";
import getVerificationMessage from "../../../../hooks/getVerificationMessage";
import isKycComplete from "../../../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../../../hooks/isAdditionalKycComplete";
import dayjs from "dayjs";

const calculateNextBillingDate = (startDate: string, frequency: string) => {
  if (!startDate) return "";
  const start = dayjs(startDate);
  const now = dayjs();

  let nextDate = start;

  if (nextDate.isAfter(now, "day")) {
    return nextDate.format("DD MMM");
  }

  while (nextDate.isBefore(now, "day") || nextDate.isSame(now, "day")) {
    const f = frequency?.toLowerCase() || "";
    if (f === "daily") {
      nextDate = nextDate.add(1, "day");
    } else if (f === "weekly") {
      nextDate = nextDate.add(1, "week");
    } else if (f === "monthly") {
      nextDate = nextDate.add(1, "month");
    } else if (f === "quarterly") {
      nextDate = nextDate.add(3, "month");
    } else if (f === "annually" || f === "yearly") {
      nextDate = nextDate.add(1, "year");
    } else {
      break;
    }
  }

  return nextDate.format("DD MMM");
};

const SavePlanDashboard = () => {
  const { currentUser, updateShowBalance } = useUser();
  const { fetchPlaninList, fetchSaveinList, fetchOngoingPlanin, fetchOngoingSavein } = useSave();
  const showBalance = currentUser?.show_balance ?? true;
  const [saveListData, setSaveListData] = useState<SavePlanListCardProps[]>([]);
  const [ongoingPlans, setOngoingPlans] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Set when every plan-list call failed because onboarding isn't done
  // (e.g. "Verify your bvn to proceed") — blocks the whole Goals dashboard
  // behind a "complete verification" prompt instead of showing empty lists.
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  // Separate from openAdditionalKyc — opened when currentUser.verified is
  // false (email not confirmed, the very first onboarding step), which is
  // a different gate than the "Verify your bvn"-style backend rejection
  // above.
  const [openAccountVerification, setOpenAccountVerification] = useState(false);

  const [openSaveDetailsDialog, setSaveDetailsDialog] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanLogo, setActivePlanLogo] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const trxref = searchParams.get('trxref');
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');
    const isSuccess = searchParams.get('success');
    const message = searchParams.get('message');

    if (isSuccess === 'false' || status === 'failed') {
      toast.error(message || "Transaction failed. Please try again.");
      searchParams.delete('trxref');
      searchParams.delete('reference');
      searchParams.delete('status');
      searchParams.delete('success');
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    } else if (status === 'successful' || status === 'success' || status === 'processing' || reference || trxref || isSuccess === 'true') {
      toast.success(message || "Save plan transaction was successful!");
      searchParams.delete('trxref');
      searchParams.delete('reference');
      searchParams.delete('status');
      searchParams.delete('success');
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setVerificationMessage(null);
    try {
      const [planinRes, saveinRes, ongoingPlaninRes, ongoingSaveinRes] = await Promise.allSettled([
        fetchPlaninList(),
        fetchSaveinList(),
        fetchOngoingPlanin(),
        fetchOngoingSavein()
      ]);

      // getPlaninList/getSaveinList are the public product catalog — those
      // succeed regardless of KYC status. getOngoingPlaninPlans/
      // getOngoingSaveinPlans are customer-scoped (/customer/fetch/...),
      // so they're the ones that actually hit the "finish onboarding" gate
      // — checked on their own rather than requiring every call to fail.
      // They can fail either as a rejected promise (non-2xx status) or a
      // resolved `{ success: false, error: { message } }` body, so both
      // are checked.
      const ongoingResults = [ongoingPlaninRes, ongoingSaveinRes];
      const message = ongoingResults
        .map((result) =>
          getVerificationMessage(result.status === "rejected" ? result.reason : result.value),
        )
        .find(Boolean);
      if (message) {
        setVerificationMessage(message);
        return;
      }

      let combined: any[] = [];
      if (planinRes.status === "fulfilled" && planinRes.value.success) {
        combined = [...combined, ...planinRes.value.data.rows];
      }
      if (saveinRes.status === "fulfilled" && saveinRes.value.success) {
        combined = [...combined, ...saveinRes.value.data.rows];
      }

      const sortPriority = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("100m65")) return 1;
        if (t.includes("save a million")) return 2;
        if (t.includes("wadiah")) return 3;
        if (t.includes("emergency")) return 4;
        return 99;
      };

      combined.sort((a, b) => sortPriority(a.title) - sortPriority(b.title));

      // Add Custom Plan mock
      combined.push({
        id: "custom",
        title: "Custom",
        description: "Create your own savings plan tailored exactly to your goals.",
        logo: null,
        icon: null,
        interest_rate: null,
        min_duration: 1,
        min_amount: 1000,
      });

      setSaveListData(
        combined.map((item) => ({
          id: item.id,
          name: item.title,
          image: item.logo || item.icon || "",
          description: item.description,
          interest_rate: item.interest_rate,
          min_duration: item.min_duration,
          min_amount: item.min_amount,
        }))
      );

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

      // sort ongoing by start_date descending (newest first)
      ongoing.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

      setOngoingPlans(ongoing);

      const tBalance = ongoing.reduce((acc, curr) => acc + (Number(curr.total_paid) || 0), 0);
      const tInterest = ongoing.reduce((acc, curr) => acc + (Number(curr.accrued_interest) || 0), 0);
      setTotalBalance(tBalance);
      setTotalInterest(tInterest);
    } catch (error) {
      console.error("Failed to load save plans", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Pop the KYC modal open as soon as we know it's needed, rather than
  // making the customer notice and click the prompt card first.
  useEffect(() => {
    if (verificationMessage) {
      setOpenAdditionalKyc(true);
    }
  }, [verificationMessage]);

  if (!isLoading && verificationMessage) {
    return (
      <>
        <div className="mt-[48px] flex justify-center">
          <div className="w-full max-w-[420px] rounded-[24px] border border-[#F4F4F4] bg-white px-[24px] py-[48px] flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#FFF3E0]">
              <i className="ri-shield-keyhole-line text-[28px] text-[#E77731]"></i>
            </span>
            <p className="mt-[16px] text-[15px] text-(--text-content-default) font-semibold">
              {verificationMessage}
            </p>
            <p className="mt-[4px] text-[13px] text-(--text-content-muted) max-w-[280px]">
              Complete this step to create or manage your savings goals.
            </p>
            <button
              type="button"
              onClick={() => setOpenAdditionalKyc(true)}
              className="mt-[20px] rounded-[99px] h-[44px] px-[24px] border border-[#E77731] text-[#E77731] font-semibold text-[14px] cursor-pointer hover:bg-[#FFF0E6] transition-colors"
            >
              Complete verification
            </button>
          </div>
        </div>
        <AdditionalKyc
          openAdditionalKycDialog={openAdditionalKyc}
          setAdditionalKycDialog={(open) => {
            setOpenAdditionalKyc(open);
            if (!open) fetchPlans();
          }}
        />
      </>
    );
  }

  return (
    <>
      <SaveDetails
        openSaveDetailsDialog={openSaveDetailsDialog}
        setSaveDetailsDialog={setSaveDetailsDialog}
        activePlanId={activePlanId}
        activePlanLogo={activePlanLogo}
      />
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKyc}
        setAdditionalKycDialog={setOpenAdditionalKyc}
      />
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      <div className="dashboard-wrapper mt-[48px]">
        <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 h-full">
          <div className="col-span-2 h-full flex flex-col">
            <div className="col-1-wrapper h-full flex flex-col">
              <div className="relative overflow-hidden rounded-[24px] px-[20px] bg-white shadow-[0_8px_30px_rgba(231,119,49,0.08)] border border-[#F4F4F4] h-full flex flex-col justify-center min-h-[300px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-[#E77731]/20 to-[#E77731]/5 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-gradient-to-tr from-[#E77731]/15 to-transparent rounded-full blur-[50px] pointer-events-none"></div>

                <div className="relative z-10 flex justify-center">
                  <div className="flex flex-col items-center">

                    <div className="text-center font-bold text-[#E77731] text-[14px] leading-[20px] tracking-[0.5px] uppercase flex items-center gap-2 bg-[#FFF0E6] px-[16px] py-[6px] rounded-full">
                      <i className="ri-wallet-3-line text-[16px]"></i>
                      <span>Savings Balance</span>
                    </div>
                    <div className="mt-[24px]">
                      <div className="text-center font-extrabold text-[#111111] text-[48px] leading-[56px] tracking-[-1px] flex justify-center items-center gap-[12px] drop-shadow-sm">
                        {isLoading ? (
                          <div className="animate-pulse bg-[#F0F0F0] h-[56px] w-[240px] rounded-[16px]"></div>
                        ) : (
                          <>
                            <p>{showBalance ? formatCurrency(totalBalance, "NGN") : "₦••••"}</p>
                            <button
                              type="button"
                              onClick={() => updateShowBalance(!showBalance)}
                              aria-label={showBalance ? "Hide balance" : "Show balance"}
                              className="cursor-pointer text-[#A0A0A0] hover:text-[#111111]"
                            >
                              <i className={`${showBalance ? "ri-eye-line" : "ri-eye-off-line"} text-[28px]`}></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-[32px] inline-flex">
                      {ongoingPlans.length > 0 && (
                        <Link to="/app/save/breakdown">
                          <div className="flex gap-3 text-center items-center justify-center cursor-pointer bg-[#FFF0E6] hover:bg-[#FFE0CD] transition-all duration-300 px-[24px] py-[12px] rounded-[999px] shadow-[0_2px_10px_rgba(231,119,49,0.05)] group border border-[#FFE0CD]">
                            <span className="font-semibold text-[#E77731] text-[14px] leading-[20px] tracking-[0.2px]">
                              See breakdown
                            </span>
                            <div className="w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                              <i className="ri-arrow-right-line text-[16px] text-[#E77731]"></i>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 xs:col-span-2 col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1 h-full">
            <div className="h-full">
              <div className="border border-[#F4F4F4] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] px-[24px] py-[24px] bg-white h-full flex flex-col">
                <div className="pb-[16px] flex justify-between items-center border-b border-[#F4F4F4]">
                  <div className="flex items-center gap-3">
                    <p className="text-[#111111] text-[15px] leading-[20px] tracking-[0.1px] font-bold">
                      Ongoing plans
                    </p>
                  </div>
                  {ongoingPlans.length > 0 && (
                    <Link to="/app/save/breakdown" className="group">
                      <div className="cursor-pointer flex gap-1 text-center items-center">
                        <span className="font-semibold text-[#888888] group-hover:text-[#E77731] transition-colors duration-200 text-[13px] leading-[20px] tracking-[0.1px]">
                          See all
                        </span>
                        <i className="ri-arrow-right-s-line text-[18px] text-[#888888] group-hover:text-[#E77731] transition-colors duration-200"></i>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="flex-1 mt-2">
                  {isLoading ? (
                    <div className="py-4 flex flex-col gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 items-center animate-pulse">
                          <div className="h-10 w-10 rounded-full bg-[#F0F0F0]" />
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="h-3 bg-[#F0F0F0] rounded w-1/2" />
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <div className="h-2 bg-[#F0F0F0] rounded w-16" />
                            <div className="h-3 bg-[#F0F0F0] rounded w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {ongoingPlans.slice(0, 5).map((plan, idx) => (
                        <div
                          key={idx}
                          className="py-[8px] px-[8px] -mx-[8px] flex justify-between items-center cursor-pointer hover:bg-[#FFF9F5] rounded-[12px] transition-colors duration-200"
                          onClick={() => handleSaveDialogOpen(
                            plan.saveplan_user?.id || plan.id,
                            plan.master_image || plan.saveplan?.logo || plan.saveplan?.icon || plan.logo || plan.icon || fundLogo
                          )}
                        >
                          <div className="flex gap-3 items-center min-w-0 flex-1 pr-2">
                            <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-white border border-[#F0F0F0] shadow-sm overflow-hidden p-[1.5px]">
                              <img
                                src={plan.master_image || plan.saveplan?.logo || plan.saveplan?.icon || plan.logo || plan.icon || fundLogo}
                                alt="Asset Icon"
                                className="w-full h-full object-contain rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = fundLogo;
                                }}
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[#111111] text-left text-[13px] leading-[18px] tracking-[0.1px] font-bold truncate">
                                {plan.title || plan.saveplan?.title || "Savings Plan"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end justify-center shrink-0 whitespace-nowrap">
                            <span className="text-[#888888] font-medium text-[10px] leading-[12px] uppercase tracking-[0.5px]">Next billing</span>
                            <span className="text-[#E77731] text-[12px] leading-[16px] tracking-[0.1px] font-bold mt-[2px]">
                              {calculateNextBillingDate(plan.start_date, plan.frequency)}
                            </span>
                          </div>
                        </div>
                      ))}

                      {ongoingPlans.length === 0 && (
                        <div className="py-10 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-3">
                            <i className="ri-folder-open-line text-[#A0A0A0] text-[24px]"></i>
                          </div>
                          <span className="text-[14px] font-medium text-[#888888]">No ongoing plans yet.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[40px]">
          <div className="plans-list-wrapper">
            {isLoading ? (
              <div className="animate-pulse flex gap-4 overflow-x-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[200px] w-[250px] bg-[#F0F0F0] rounded-[16px]"></div>
                ))}
              </div>
            ) : (
              <SaveList saveList={saveListData} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SavePlanDashboard;
