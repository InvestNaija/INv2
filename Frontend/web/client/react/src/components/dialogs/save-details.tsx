import { Dialog, Menu, type DialogProps } from "@mui/material";
import SaveIcon from "../../assets/icons/edu-icon.svg";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import Button from "../atoms/buttons";
import { useState, useEffect } from "react";
import DeletePlan from "./delete-plan";
import WithdrawPlan from "./withdraw-plan";
import { useSave } from "../../contexts/saveContext";
import formatCurrency from "../../hooks/FormatCurrency";
import dayjs from "dayjs";
import PaymentGateway from "./payment-gateway";
import PaymentSuccess from "./payment-success";
import { toast } from "react-toastify";
import { type PaymentGatewayConfig, type SavedCard } from "../../models/walletModel";
import { useWalletFeatures } from "../../contexts/walletContext";
import { useUser } from "../../contexts/userContext";
import AdditionalKyc from "./additional-kyc";
import AccountVerification from "./account-verification";
import getVerificationMessage from "../../hooks/getVerificationMessage";
import isKycComplete from "../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../hooks/isAdditionalKycComplete";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 4,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 4,
    backgroundColor: "#E77731",
    ...theme.applyStyles("dark", {
      backgroundColor: "#E77731",
    }),
  },
}));

interface SaveDetailsProps {
  setSaveDetailsDialog: (open: boolean) => void;
  openSaveDetailsDialog: boolean;
  activePlanId?: string | null;
  activePlanLogo?: string | null;
}

const SaveDetails = (props: SaveDetailsProps) => {
  const [openDeletePlanDialog, setDeletePlanDialog] = useState(false);
  const [openWithdrawPlanDialog, setWithdrawPlanDialog] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentUser } = useUser();
  const showBalance = currentUser?.show_balance ?? true;
  const [openPaymentGateway, setOpenPaymentGateway] = useState(false);
  const [paymentGatewayConfigs, setPaymentGatewayConfigs] = useState<PaymentGatewayConfig[]>([]);
  const { fetchPlanMetricLiquidate, topUpPlan } = useSave();
  const { fetchPaymentGatewayOptions, fetchGatewaySavedCards, balance: walletBalance } = useWalletFeatures();
  const [availablePartners, setAvailablePartners] = useState<string[]>([]);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [openPaymentSuccess, setOpenPaymentSuccess] = useState(false);
  const [topupAmount, setTopupAmount] = useState(0);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);

  const fetchPaymentConfigs = async () => {
    setIsLoadingConfigs(true);
    try {
      const customerId = currentUser?.id || "";
      const planId = planDetails?.id || props.activePlanId || "";
      
      const [res, cardsRes] = await Promise.allSettled([
        fetchPaymentGatewayOptions("saveplan", planId),
        fetchGatewaySavedCards(customerId),
      ]);
      
      if (res.status === "fulfilled" && res.value.success) {
        setPaymentGatewayConfigs(res.value.data || []);
        setAvailablePartners((res.value.data || []).map((c: PaymentGatewayConfig) => c.gateway));
      }
      if (cardsRes.status === "fulfilled" && cardsRes.value.success) {
        setSavedCards(cardsRes.value.data || []);
      }
    } catch (err) {
      console.error("Failed to load payment options", err);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const handlePaymentContinue = async (
    amount: number,
    method: string,
    partner?: string,
    cardId?: string,
    _receiptFile?: File,
    _saveCard?: boolean
  ) => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    if (!planDetails) return;

    setIsSubmittingPayment(true);
    try {
      const selectedConfig = paymentGatewayConfigs.find(c => c.gateway === (partner || "paystack")) || paymentGatewayConfigs[0];
      const gatewayId = selectedConfig?.id;
      const redirectUrl = `${window.location.protocol}//${window.location.host}/app/save/dashboard`;
      const isNewCardPayment = method === "payment_partners" && !cardId;

      const payload: any = {
        amount,
        paymentMethod: method === "wallet" ? "wallet" : "online",
        gateway: method === "wallet" ? "wallet" : (method === "direct_transfer" ? "banktransfer" : (partner || "paystack")),
        currency: planDetails.currency || "NGN",
        productId: planDetails.saveplan_user?.id || planDetails.id,
        source: "saveplan",
        type: "credit",
        product_type: planDetails.type || "planin",
        redirect_url: redirectUrl,
        post_url: `${import.meta.env.VITE_SAVEPLAN_BASE_URL}/save-plan/product/top-up`,
        gatewayEndpoints: `${import.meta.env.VITE_BASE_URL}/3rd-party-services/gateway?modules=saveplan&id=${planDetails.id}`,
        callback_params: {
          module: "saveplan",
          method: "topup",
          asset_id: planDetails.id,
          ...(isNewCardPayment ? { gateway_id: gatewayId } : {}),
          saveCard: method === "payment_partners" && !cardId,
          brokerageInfo: {}
        },
        ...(cardId ? { payment_type: "saved_card", saved_card_id: cardId } : {}),
        ...(isNewCardPayment ? {
          gateway_id: gatewayId,
          channel: partner || "paystack",
          channels: ["card", "bank_transfer"]
        } : {}),
        ...(method === "direct_transfer" ? { channel: "banktransfer" } : {})
      };

      const response = await topUpPlan(payload);

      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
        return;
      }

      setOpenPaymentGateway(false);
      setTopupAmount(amount);
      setOpenPaymentSuccess(true);
    } catch (error: any) {
      console.error(error);
      const verificationMessage = getVerificationMessage(error);
      if (verificationMessage) {
        toast.error(verificationMessage);
        setOpenAdditionalKyc(true);
        return;
      }
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || "Failed to process top up";
      toast.error(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (props.openSaveDetailsDialog && props.activePlanId) {
      setIsLoading(true);
      fetchPlanMetricLiquidate(props.activePlanId)
        .then((res: any) => {
          if (isMounted && res.success) {
            setPlanDetails(res.data);
          }
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else if (!props.openSaveDetailsDialog) {
      setPlanDetails(null);
    }
    return () => {
      isMounted = false;
    };
  }, [props.openSaveDetailsDialog, props.activePlanId]);

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      props.setSaveDetailsDialog(false);
    }
  };

  // three dot menu options
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // three dot menu options

  // delete dialog function

  const handleDeletePlanDialog = () => {
    setDeletePlanDialog(true);
  };
  // delete dialog function

  // withdraw dialog function

  const handleWithdrawPlanDialog = () => {
    setWithdrawPlanDialog(true);
    //  props.setSaveDetailsDialog(false);
  };
  // delete withdraw function

  // Receives the result from the child
  const handleDeletePlanDialogClose = (_finalResult: any) => {
      props.setSaveDetailsDialog(false);
  };


  return (
    <>
      <DeletePlan
        openDeletePlanDialog={openDeletePlanDialog}
        setDeletePlanDialog={setDeletePlanDialog}
        onCloseDeletePlanDialog={handleDeletePlanDialogClose}
      />
      <WithdrawPlan
        openWithdrawPlanDialog={openWithdrawPlanDialog}
        setWithdrawPlanDialog={setWithdrawPlanDialog}
        planDetails={planDetails}
        activePlanLogo={props.activePlanLogo || undefined}
      />
      <Dialog
        open={props.openSaveDetailsDialog}
        onClose={handleDialogClose}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(0px)", // Apply the blur effect
              // background: "#0F0F0F", // Add a semi-transparent background
              opacity: "0.5",
            },
          },
          paper: {
            sx: {
              backgroundColor: "#fff", // Change the background color
              borderRadius: "0", // Add rounded corners
              padding: "34px 24px",
              //   width: "40%",
              //   minWidth: "90%",

              height: "100vh !important",
              maxHeight: "100vh !important",
              position: "absolute",
              top: "0",
              right: "0",
              margin: "0",
            },
          },
        }}
      >
        <div>
          {openPaymentGateway && (
            <PaymentGateway
              open={openPaymentGateway}
              setOpen={setOpenPaymentGateway}
              title="Top up Plan"
              walletBalance={walletBalance}
              savedCards={savedCards}
              availablePartners={availablePartners}
              configs={paymentGatewayConfigs}
              isSubmitting={isSubmittingPayment}
              currency={planDetails?.currency || "NGN"}
              isLoadingConfigs={isLoadingConfigs}
              onRefresh={fetchPaymentConfigs}
              onContinue={handlePaymentContinue}
            />
          )}
          <div className="">
            <div className="flex justify-start">
              <span
                className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px]"
                onClick={() => props.setSaveDetailsDialog(false)}
              >
                <i className="ri-close-fill text-[24px] leading-[28px]"></i>
              </span>
            </div>
          </div>
          <div className="save-details-wrapper mt-[48px] md:w-md xl:w-md lg:w-md xs:w-sm sm:w-sm w-sm"></div>
          <div className="">
            <div>
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 mt-8 mb-10">
                  <div className="h-[64px] w-[64px] bg-[#F0F0F0] rounded-[12px] animate-pulse"></div>
                  <div className="h-7 w-48 bg-[#F0F0F0] rounded-[4px] animate-pulse mt-2"></div>
                  <div className="h-4 w-64 bg-[#F0F0F0] rounded-[4px] animate-pulse"></div>
                  <div className="h-2 w-full bg-[#F0F0F0] rounded-[4px] animate-pulse mt-8"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center ">
                    <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-white border border-[#F0F0F0] shadow-sm overflow-hidden p-1">
                      <img src={props.activePlanLogo || SaveIcon} height="64" width="64" alt="Asset Icon" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="mt-[16px]">
                    <h3 className="text-[#0F0F0F] text-[20px] leading-[28px] font-semibold text-center capitalize">
                      {planDetails?.title || "Plan Details"}
                    </h3>
                  </div>
                  <div className="text-center mt-[4px]">
                    <span className="text-[#E77731] text-[14px] leading-[20px] font-medium text-center tracking-[0.1px]">
                      Next payment date is {planDetails?.nextBillingDate ? dayjs(planDetails.nextBillingDate).format('DD MMM, YYYY') : "TBD"}
                    </span>
                  </div>

                  <div className="mt-[40px]">
                    <div className="progress-bar-wrapper ">
                      <BorderLinearProgress
                        variant="determinate"
                        value={Number(planDetails?.percentageComplete || 0)}
                        aria-label="Progress"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <span className="text-[12px] font-medium leading-[16px] tracking-[0.2px] text-[#A1A1A1]">
                          {Number(planDetails?.percentageComplete || 0).toFixed(2)}% complete
                        </span>
                      </div>
                      <div>
                        <span className="text-[12px] font-medium leading-[16px] tracking-[0.2px] text-[#A1A1A1]">
                          {showBalance
                            ? `${formatCurrency(Number(planDetails?.futureValue || 0) - Number(planDetails?.totalAvailablePayout || 0), planDetails?.currency || "NGN")} Remaining`
                            : "₦•••• Remaining"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-[32px]">
                <div className="flex gap-3 sm:flex-col flex-col  md:flex-row lg:flex-row xl:flex-row items-center ">
                  <div>
                    <Button
                      variant="primary"
                      disabled={false}
                      isLoading={false}
                      className="rounded-[99px] h-[56px] px-[80px]"
                      onClick={() => {
                        setOpenPaymentGateway(true);
                        fetchPaymentConfigs();
                      }}
                    >
                      Top up
                    </Button>
                  </div>
                  <div>
                    <Button
                      onClick={handleWithdrawPlanDialog}
                      variant="empty"
                      disabled={false}
                      isLoading={false}
                      className="rounded-[99px] h-[56px] px-[80px] border-[#DCDCDC]"
                    >
                      Liquidate
                    </Button>
                  </div>
                  <div className="hidden">
                    <div>
                      <Button
                        onClick={handleClick}
                        id="user-positioned-button"
                        aria-controls={
                          open ? "user-positioned-menu" : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={open}
                        variant="empty"
                        disabled={false}
                        isLoading={false}
                        className="rounded-[99px] h-[56px] w-[56px] px-[16px] border-[#DCDCDC]"
                      >
                        •••
                      </Button>
                      <Menu
                        id="user-positioned-menu"
                        aria-labelledby="user-positioned-button"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                          paper: {
                            sx: {
                              borderRadius: "16px",
                              border: "1px solid #F4F4F4",
                              // width: "360px", // Set explicit width
                              mt: "10px", // Add top margin (offset from button)
                              maxWidth: "100%", // Optional: ensure it doesn't break
                              // boxShadow:'none'
                            },
                          },
                        }}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                      >
                        <div className="user-content-wrapper ">
                          <div className="px-[16px] py-[12px]">
                            <div
                              className="flex items-center gap-[8px] cursor-pointer"
                              onClick={() => {
                                handleClose();
                              }}
                            >
                              <div>
                                <i className="ri-pause-line text-[#0F0F0F] text-[24px]"></i>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-[16px] text-[#262626]leading-[24px] font-medium">
                                  <span>Pause plan</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-[16px] py-[12px]">
                            <div
                              className="flex items-center gap-[8px] cursor-pointer"
                              onClick={() => {
                                handleClose();
                                handleDeletePlanDialog();
                              }}
                            >
                              <div>
                                <i className="ri-delete-bin-fill text-[#E5333E] text-[24px]"></i>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-[16px] text-[#E5333E]leading-[24px] font-medium">
                                  <span>Delete plan</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[64px]">
                <div>
                  <h6 className="text-[14px] text-[var(--text-content-default)] font-bold leading-[20px] tracking-[0.1px]">
                    Details
                  </h6>
                </div>

                {isLoading ? (
                  <div className="mt-[16px] flex flex-col gap-4">
                    <div className="h-4 bg-[#F0F0F0] rounded-[4px] animate-pulse w-full"></div>
                    <div className="h-4 bg-[#F0F0F0] rounded-[4px] animate-pulse w-3/4"></div>
                  </div>
                ) : (
                  <div className="mt-[16px]">
                    <div className="py-[8px]">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className=" text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Contributed Amount</span>
                          </div>
                          <div className="text-[16px] text-[#222] font-semibold leading-[24px] tracking-[0.32px]">
                            <span>{!showBalance ? "₦••••" : planDetails?.contributedAmount !== undefined ? formatCurrency(Number(planDetails.contributedAmount), planDetails?.currency || "NGN") : "-"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className=" text-right text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Accrued Interest</span>
                          </div>
                          <div className="text-right text-[16px] text-[#222] font-semibold leading-[24px] tracking-[0.32px]">
                            <span>{!showBalance ? "₦••••" : planDetails?.accrued_interest !== undefined ? formatCurrency(Number(planDetails.accrued_interest), planDetails?.currency || "NGN") : "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-[8px]">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className=" text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Duration</span>
                          </div>
                          <div className="text-[16px] text-[#222] font-semibold leading-[24px] tracking-[0.32px]">
                            <span>{planDetails ? `${dayjs(planDetails.endDate).diff(dayjs(planDetails.startDate), 'month')} months` : "-"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className=" text-right text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Maturity date</span>
                          </div>
                          <div className="text-right text-[16px] text-[#222] font-semibold leading-[24px] tracking-[0.32px]">
                            <span>{planDetails?.endDate ? dayjs(planDetails.endDate).format('DD MMM, YYYY') : "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-[8px]">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className=" text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Frequency</span>
                          </div>
                          <div className="text-[16px] text-[#222] font-semibold leading-[24px] tracking-[0.32px] capitalize">
                            <span>{planDetails?.frequency || "-"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className=" text-right text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Frequency amount</span>
                          </div>
                          <div className="text-right text-[16px] text-[#222] font-semibold leading-[24px] tracking-[0.32px]">
                            <span>{!showBalance ? "₦••••" : planDetails?.pmt ? formatCurrency(Number(planDetails.pmt), planDetails?.currency || "NGN") : "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-[8px]">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className=" text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Start date</span>
                          </div>
                          <div className="text-[16px] text-[#222] font-semibold leading-[24px] tracking-[0.32px]">
                            <span>{planDetails?.startDate ? dayjs(planDetails.startDate).format('DD MMM, YYYY') : "-"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="text-right text-[14px] text-[#A1A1A1] font-medium leading-[20px] tracking-[0.28px]">
                            <span>Future Value</span>
                          </div>
                          <div className="text-right text-[16px] text-[#E77731] font-bold leading-[24px] tracking-[0.32px]">
                            <span>{!showBalance ? "₦••••" : planDetails?.futureValue !== undefined ? formatCurrency(Number(planDetails.futureValue), planDetails?.currency || "NGN") : "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {openPaymentSuccess && (
        <PaymentSuccess
          open={openPaymentSuccess}
          setOpen={(open) => {
            setOpenPaymentSuccess(open);
            if (!open) {
              // Optionally reload plan metrics when closed
              if (props.activePlanId) {
                fetchPlanMetricLiquidate(props.activePlanId)
                  .then((res: any) => {
                    if (res.success) setPlanDetails(res.data);
                  })
                  .catch(console.error);
              }
            }
          }}
          amount={topupAmount}
          currency={planDetails?.currency || "NGN"}
          title="Plan topped up successfully"
        />
      )}
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKyc}
        setAdditionalKycDialog={setOpenAdditionalKyc}
      />
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
    </>
  );
};

export default SaveDetails;
