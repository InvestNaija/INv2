import { Dialog, type DialogProps } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AccountVerification from "./account-verification";
import AdditionalKyc from "./additional-kyc";
import { useUser } from "../../contexts/userContext";
import isKycComplete from "../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../hooks/isAdditionalKycComplete";

interface InvestmentOptionsProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
}

interface InvestmentOption {
  title: string;
  description: string;
  icon: string;
  bgClass: string;
  // Omitted for options that don't have a built destination yet — selecting
  // one of those shows a "coming soon" toast instead of navigating.
  path?: string;
}

const INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    title: "Stocks",
    description:
      "Own a piece of Nigeria's biggest companies. Trade listed stocks across every sector",
    icon: "ri-line-chart-line",
    bgClass: "bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] shadow-[0_4px_12px_rgba(79,70,229,0.3)]",
    path: "/app/invest/trade/dashboard",
  },
  {
    title: "Investments",
    description:
      "Access a diverse portfolio including Mutual Funds, Dollar Funds, IPOs, and Government Bonds. Start with ₦1,000.",
    icon: "ri-pie-chart-2-line",
    bgClass: "bg-gradient-to-br from-[#059669] to-[#10B981] shadow-[0_4px_12px_rgba(16,185,129,0.3)]",
    path: "/app/invest/investments/dashboard",
  },
  {
    title: "Goals",
    description:
      "Automate your savings and grow your money with competitive returns",
    icon: "ri-flag-2-line",
    bgClass: "bg-gradient-to-br from-[#EA580C] to-[#F97316] shadow-[0_4px_12px_rgba(249,115,22,0.3)]",
    path: "/app/save/dashboard",
  },
];

// Entry point for every investment product — opened from "Start investing"
// on Overview. Each row routes to that product's real dashboard; options
// without a built page yet (IPOs, Government Bonds, Dollar Mutual Funds)
// show a "coming soon" toast rather than navigating somewhere fake.
const InvestmentOptions = ({ openDialog, setDialog }: InvestmentOptionsProps) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setDialog(false);
    }
  };

  // Trading isn't available on a dependent account (see
  // features/ui/invest/trade/index.tsx's redirect), so don't offer it here.
  const options = currentUser?.isMinor
    ? INVESTMENT_OPTIONS.filter((option) => option.title !== "Stocks")
    : INVESTMENT_OPTIONS;

  const handleSelect = (option: InvestmentOption) => {
    if (!option.path) {
      toast.info(`${option.title} is coming soon`);
      return;
    }
    if (!isKycComplete(currentUser)) {
      setDialog(false);
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setDialog(false);
      setOpenAdditionalKyc(true);
      return;
    }
    setDialog(false);
    navigate(option.path);
  };

  return (
    <>
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.25)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: { xs: "24px", sm: "32px" },
            padding: { xs: "24px 20px", sm: "40px" },
            width: { xs: "100%", sm: "560px" },
            maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
            margin: { xs: "12px", sm: "32px" },
            maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
            boxShadow: "0px 32px 80px rgba(0, 0, 0, 0.12)",
          },
        },
      }}
    >
      <div className="absolute top-[16px] right-[16px] sm:top-[24px] sm:right-[24px] z-10">
        <button
          className="flex items-center justify-center w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] text-[#888888] bg-[#F7F7F7] hover:bg-[#EBEBEB] hover:text-[#111111] rounded-full transition-all duration-200 active:scale-90"
          onClick={() => setDialog(false)}
        >
          <i className="ri-close-line text-[20px] sm:text-[24px]"></i>
        </button>
      </div>

      <div className="mb-[24px] sm:mb-[36px] mt-[4px] pr-[40px] sm:pr-0">
        <h2 className="text-[24px] sm:text-[32px] font-extrabold text-[#111111] tracking-tight leading-[30px] sm:leading-[40px]">
          Start Investing
        </h2>
        <p className="text-[#666666] text-[13px] sm:text-[15px] mt-[6px] sm:mt-[8px] leading-[19px] sm:leading-[22px] max-w-full sm:max-w-[90%]">
          Choose an investment vehicle to begin building your wealth and growing your portfolio.
        </p>
      </div>

      <div className="flex flex-col gap-[12px] sm:gap-[20px] overflow-y-auto pb-4">
        {options.map((option) => (
          <div
            key={option.title}
            onClick={() => handleSelect(option)}
            className="flex items-center gap-[14px] sm:gap-[24px] p-[14px] pr-[14px] sm:p-[20px] sm:pr-[24px] rounded-[20px] sm:rounded-[28px] bg-[#F9F9F9] border border-transparent cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#E77731]/20 hover:shadow-[0_16px_40px_rgba(231,119,49,0.08)] active:scale-[0.98] sm:hover:-translate-y-1 group"
          >
            <div className={`flex h-[52px] w-[52px] sm:h-[72px] sm:w-[72px] shrink-0 items-center justify-center rounded-[16px] sm:rounded-[24px] ${option.bgClass} transform transition-all group-hover:scale-110 group-hover:-rotate-3 duration-300 ease-out`}>
              <i className={`${option.icon} text-[22px] sm:text-[32px] text-white drop-shadow-md`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#111111] text-[15px] sm:text-[18px] font-extrabold group-hover:text-[#E77731] transition-colors duration-300 tracking-tight">
                {option.title}
              </p>
              <p className="mt-[3px] sm:mt-[6px] text-[#5A5A5A] text-[12.5px] sm:text-[14px] leading-[18px] sm:leading-[22px] font-medium pr-0 sm:pr-[12px] line-clamp-2 sm:line-clamp-none">
                {option.description}
              </p>
            </div>
            <div className="flex items-center justify-center w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] rounded-full bg-transparent group-hover:bg-[#FFF0E6] transition-colors duration-300 shrink-0">
              <i className="ri-arrow-right-s-line text-[20px] sm:text-[24px] text-[#A0A0A0] group-hover:text-[#E77731] group-hover:translate-x-0.5 transition-transform duration-300"></i>
            </div>
          </div>
        ))}
      </div>
    </Dialog>
    <AccountVerification
      openDialog={openAccountVerification}
      setDialog={setOpenAccountVerification}
    />
    <AdditionalKyc
      openAdditionalKycDialog={openAdditionalKyc}
      setAdditionalKycDialog={setOpenAdditionalKyc}
    />
    </>
  );
};

export default InvestmentOptions;
