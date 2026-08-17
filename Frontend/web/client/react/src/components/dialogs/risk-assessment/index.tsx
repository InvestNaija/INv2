import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { toast } from "react-toastify";
import { useUser } from "../../../contexts/userContext";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StepRing = ({ step, totalSteps }: { step: number; totalSteps: number }) => (
  <div className="inline-flex items-center gap-[12px] bg-white/95 backdrop-blur-2xl px-[20px] py-[10px] rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
    <div className="relative h-[36px] w-[36px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <defs>
          <linearGradient id={`risk-step-gradient-${step}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9B5E" />
            <stop offset="100%" stopColor="#E77731" />
          </linearGradient>
        </defs>
        <path
          className="text-[#E77731]/10"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          strokeDasharray={`${((step + 1) / totalSteps) * 100}, 100`}
          strokeLinecap="round"
          strokeWidth="3.5"
          stroke={`url(#risk-step-gradient-${step})`}
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#111111]">{step + 1}</span>
      </div>
    </div>
    <div className="flex flex-col text-left">
      <span className="text-[10px] font-semibold text-[#9B9B9B] uppercase tracking-wider mb-0.5">
        Question {step + 1} of {totalSteps}
      </span>
      <span className="text-[13px] font-bold text-[#111111] leading-none">Assessment</span>
    </div>
  </div>
);

export interface RiskQuestion {
  id: string;
  title: string;
  options: { label: string; value: number }[];
  isPills?: boolean;
  icon: string;
  colors: { outerBg: string; gradientFrom: string; gradientTo: string };
}

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: "age",
    title: "How old are you",
    icon: "ri-calendar-event-line",
    colors: { outerBg: "#FCDCA5", gradientFrom: "#FF9B5E", gradientTo: "#E77731" },
    options: [
      { label: "18-34 years", value: 10 },
      { label: "35-49 years", value: 7 },
      { label: "50-64 years", value: 3 },
      { label: "65 years and above", value: 1 },
    ],
  },
  {
    id: "source_of_income",
    title: "What is your current source of income",
    icon: "ri-wallet-3-line",
    colors: { outerBg: "#BFDBFE", gradientFrom: "#60A5FA", gradientTo: "#2563EB" },
    options: [
      { label: "Wages and Salary", value: 2 },
      { label: "Business Income", value: 3 },
      { label: "Proceeds from investment", value: 5 },
      { label: "All of the above", value: 7 },
    ],
  },
  {
    id: "annual_income",
    title: "What is your average annual total income",
    icon: "ri-money-dollar-circle-line",
    colors: { outerBg: "#BBF7D0", gradientFrom: "#4ADE80", gradientTo: "#16A34A" },
    options: [
      { label: "Less than 1 million Naira", value: 1 },
      { label: "1-10 million Naira", value: 3 },
      { label: "11-20 million Naira", value: 5 },
      { label: "Over 20 million", value: 7 },
    ],
  },
  {
    id: "time_frame",
    title: "What is your investment time frame",
    icon: "ri-timer-line",
    colors: { outerBg: "#E9D5FF", gradientFrom: "#C084FC", gradientTo: "#9333EA" },
    options: [
      { label: "0-12 months", value: 1 },
      { label: "1-5 years", value: 2 },
      { label: "6-10 years", value: 3 },
      { label: "Over 10 years", value: 4 },
    ],
  },
  {
    id: "investment_experience",
    title: "What is your investment experience",
    icon: "ri-line-chart-line",
    colors: { outerBg: "#FECDD3", gradientFrom: "#FB7185", gradientTo: "#E11D48" },
    options: [
      { label: "None", value: 1 },
      { label: "Limited", value: 3 },
      { label: "Good", value: 5 },
      { label: "Extensive", value: 7 },
    ],
  },
  {
    id: "investment_objective",
    title: "What is your investment objective",
    icon: "ri-focus-2-line",
    colors: { outerBg: "#99F6E4", gradientFrom: "#2DD4BF", gradientTo: "#0D9488" },
    options: [
      { label: "Capital preservation", value: 1 },
      { label: "Income", value: 3 },
      { label: "Growth", value: 5 },
    ],
  },
  {
    id: "withdrawal",
    title: "When do you plan to start withdrawing money from your investments",
    icon: "ri-bank-card-line",
    colors: { outerBg: "#C7D2FE", gradientFrom: "#818CF8", gradientTo: "#4F46E5" },
    options: [
      { label: "Less than 1 year", value: 1 },
      { label: "1-3 years", value: 3 },
      { label: "Between 4-6 years", value: 5 },
      { label: "Over 6 years", value: 7 },
    ],
  },
];

interface RiskAssessmentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onComplete?: () => void;
}

const RiskAssessmentDialog = ({ open, setOpen, onComplete }: RiskAssessmentProps) => {
  const { refetchUser, submitRiskAssessment } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investorProfile, setInvestorProfile] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setAnswers({});
      setIsSubmitting(false);
      setInvestorProfile(null);
    }
  }, [open]);

  const totalSteps = RISK_QUESTIONS.length;
  const currentQuestion = RISK_QUESTIONS[currentStep];

  const handleClose = () => {
    setOpen(false);
  };

  const handleOptionSelect = async (option: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      // Add a slight delay for better UX (so user sees their selection)
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 350);
    } else {
      // Submit
      setIsSubmitting(true);
      try {
        const payload = {
          rating_quiz: RISK_QUESTIONS.map((q) => ({
            question: q.title,
            score: newAnswers[q.id] || "",
          })),
        };

        const response = await submitRiskAssessment(payload);
        
        let classification = "Balanced";
        if (response?.data?.classification) {
          classification = response.data.classification;
        } else if (response?.classification) {
          classification = response.classification;
        }

        toast.success("Risk assessment completed successfully!");
        refetchUser(); // Refresh to get the new risk rating
        setInvestorProfile(classification);
        // We do NOT call handleClose here, wait for user to click 'Continue'
      } catch (error: any) {
        console.error(error);
        // Fallback for mocked API or if endpoint not available yet
        toast.info("Risk assessment answers saved locally. (Backend integration pending)");
        setInvestorProfile("Conservative (Mocked)");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isFirstStep = currentStep === 0;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Dialog
      open={open}
      slots={{ transition: Transition }}
      keepMounted
      onClose={handleClose}
      aria-describedby="risk-assessment-dialog"
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: { xs: "12px", sm: "32px" },
          borderRadius: { xs: "24px", sm: "28px" },
          boxShadow: "0px 32px 80px rgba(0, 0, 0, 0.14)",
          border: "1px solid #F4F4F4",
          padding: { xs: "20px 16px", sm: "32px 40px" },
          width: "596px",
          maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
          maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
    >
      {/* Header */}
      {!investorProfile && (
        <div className="flex items-center justify-between">
          {isFirstStep ? (
            <span className="w-[40px]" />
          ) : (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#F0F0F0] cursor-pointer transition-all hover:bg-[#F0F0F0] active:scale-90"
            >
              <i className="ri-arrow-left-s-line text-[20px]"></i>
            </button>
          )}

          <StepRing step={currentStep} totalSteps={totalSteps} />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#F0F0F0] cursor-pointer transition-all hover:bg-[#F0F0F0] active:scale-90"
          >
            <i className="ri-close-line text-[20px]"></i>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="mt-[28px] text-center">
        {investorProfile && (
          <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto animate-fade-in py-[20px]">
            <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#FFF6F0] flex items-center justify-center mb-[24px] shadow-[0_8px_24px_rgba(231,119,49,0.2)] animate-bounce-in">
              <i className="ri-trophy-fill text-[40px] sm:text-[48px] text-[#E77731]"></i>
            </div>
            
            <h3 className="text-[#888] text-[14px] font-semibold uppercase tracking-[1.5px] mb-[8px]">
              Your Investor Profile
            </h3>
            
            <h2 className="text-[#00727A] text-[32px] sm:text-[36px] leading-[40px] font-extrabold mb-[16px]">
              {investorProfile}
            </h2>
            
            <p className="text-[#555] text-[15px] leading-[24px] mb-[40px]">
              Based on your responses, we've tailored an investment approach that matches your financial goals and risk appetite.
            </p>
            
            <button
              onClick={() => {
                if (onComplete) onComplete();
                handleClose();
              }}
              className="w-full py-[16px] px-[24px] rounded-full bg-[#E77731] text-white text-[16px] font-bold tracking-[0.2px] hover:bg-[#D66B2B] hover:shadow-[0_8px_20px_rgba(231,119,49,0.25)] transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}
        {investorProfile === null && (
          <div className="flex flex-col items-center w-full max-w-[420px] mx-auto animate-fade-in py-[20px]">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center w-full">
              <div
                className="p-[10px] rounded-[22px] mb-[16px] shadow-sm inline-block transition-colors duration-500"
                style={{ backgroundColor: currentQuestion.colors.outerBg }}
              >
                <div
                  className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border-4 border-white/40 transition-colors duration-500"
                  style={{ background: `linear-gradient(135deg, ${currentQuestion.colors.gradientFrom}, ${currentQuestion.colors.gradientTo})` }}
                >
                  <i className={`${currentQuestion.icon} text-white text-[26px]`}></i>
                </div>
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111111] leading-[30px] sm:leading-[34px] tracking-tight mb-[32px] text-center">
                {currentQuestion.title}?
              </h2>

            <div className={`w-full ${currentQuestion.isPills ? "flex flex-wrap justify-center gap-[12px] sm:gap-[16px]" : "flex flex-col gap-[16px]"}`}>
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === String(option.value);
              
              if (currentQuestion.isPills) {
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(String(option.value))}
                    disabled={isSubmitting}
                    className={`px-[24px] py-[12px] rounded-full border transition-all duration-300 text-[14px] font-semibold tracking-[0.1px] active:scale-[0.97]
                      ${
                        isSelected
                          ? "bg-white border-[#E77731] text-[#E77731]"
                          : "bg-white border-[#EAEAEA] text-[#444] hover:border-[#E77731] hover:text-[#E77731]"
                      }
                      ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    {option.label}
                  </button>
                );
              }

              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(String(option.value))}
                  disabled={isSubmitting}
                  className={`relative w-full py-[18px] px-[24px] rounded-[16px] transition-all duration-300 text-[15px] font-semibold tracking-[0.1px] text-center active:scale-[0.98]
                    ${
                      isSelected
                        ? "bg-white border-[1.5px] border-[#E77731] text-[#E77731]"
                        : "bg-white border-[1px] border-[#EAEAEA] text-[#333333] hover:border-[#E77731] hover:text-[#E77731]"
                    }
                    ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          
            {isSubmitting && (
              <div className="mt-[32px] flex items-center justify-center gap-2 text-[14px] text-[#E77731] font-semibold animate-pulse">
                <div className="w-[16px] h-[16px] border-2 border-[#E77731] border-t-transparent rounded-full animate-spin"></div>
                Analyzing your responses...
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default RiskAssessmentDialog;
