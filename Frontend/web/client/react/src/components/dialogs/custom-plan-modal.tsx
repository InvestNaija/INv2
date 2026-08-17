import React, { useState } from "react";
import { Dialog, Slide } from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { useNavigate } from "react-router-dom";
import customIcon from "../../assets/icons/custom.svg";
import SaveIcon from "../../assets/icons/saveplan.svg";
import INIcon from "../../assets/icons/investnaija-without-chapel.svg";



interface CustomPlanModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CustomPlanModal = ({ open, setOpen }: CustomPlanModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [planType, setPlanType] = useState<"planin" | "savein" | null>(null);
  const [planName, setPlanName] = useState("");

  const handleClose = () => {
    setOpen(false);
    // Reset state after transition
    setTimeout(() => {
      setStep(1);
      setPlanType(null);
      setPlanName("");
    }, 300);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      handleClose();
    }
  };

  const handleContinue = () => {
    if (step === 1 && planType) {
      setStep(2);
    } else if (step === 2 && planName.trim()) {
      handleClose();
      // Navigate to drilldown and pass state
      navigate("/app/save/drill-down/custom", {
        state: {
          type: planType,
          name: planName.trim(),
        },
      });
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      sx={{ 
        zIndex: 1400,
        "& .MuiDialog-paper": { 
          backgroundColor: "#F9F9F9",
          minHeight: "100dvh",
          margin: 0,
          maxWidth: "none",
          width: "100%"
        } 
      }}
    >
      <div className="flex flex-col min-h-[100dvh] bg-[#F9F9F9] w-full overflow-y-auto">
        <div className="w-full bg-[#F9F9F9] sticky top-0 z-50">
          <div className="grid grid-cols-3 py-[16px] sm:py-[24px] items-center px-[16px] sm:px-[24px]">
            <div className="flex justify-self-start">
              <div
                onClick={handleBack}
                className="cursor-pointer inline-flex items-center gap-[6px] bg-[#FFFFFF] hover:bg-[#F7F7F7] active:scale-95 transition-all px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] rounded-full border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M22.0003 13.0001L22.0004 11.0002H5.82845L9.77817 7.05044L8.36396 5.63623L2 12.0002L8.36396 18.3642L9.77817 16.9499L5.8284 13.0002L22.0003 13.0001Z" fill="#0F0F0F"/></svg>
                <span className="text-[#0F0F0F] text-[13px] sm:text-[14px] leading-[20px] font-medium whitespace-nowrap">Back</span>
              </div>
            </div>
            
            <div className="flex items-center justify-self-center">
              <img src={INIcon} alt="IN Icon" className="h-[22px] sm:h-[28px] w-auto" />
            </div>
            
            <div className="flex justify-self-end">
              <div
                onClick={handleClose}
                className="cursor-pointer inline-flex items-center justify-center bg-transparent hover:bg-black/5 active:scale-95 transition-all px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] rounded-full"
              >
                <span className="text-[#5A5A5A] hover:text-[#0F0F0F] text-[14px] sm:text-[15px] leading-[20px] font-medium whitespace-nowrap transition-colors">Cancel</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4 mb-8 px-4">
            <div className="inline-flex items-center gap-4 bg-white/95 backdrop-blur-2xl px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-[#F0F0F0] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="in-gradient-modal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF9B5E" />
                      <stop offset="100%" stopColor="#E77731" />
                    </linearGradient>
                  </defs>
                  <path
                    className="text-[#00585E]/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    strokeDasharray={`${(step / 5) * 100}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    stroke="url(#in-gradient-modal)"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[12px] font-bold text-[#00585E] font-outfit">{step}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[#808080] uppercase tracking-wider mb-0.5">Step {step} of 5</span>
                <span className="text-[15px] font-bold text-[#111111] leading-none">Goal Info</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-[24px] pt-[20px] flex flex-col items-center max-w-[500px] mx-auto w-full pb-[120px]">
          {step === 1 ? (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#FCDCA5] p-3 rounded-[20px] mb-8 shadow-sm">
                <div className="bg-[#E77731] w-[64px] h-[64px] rounded-[16px] flex items-center justify-center border-4 border-white/20">
                  <i className="ri-focus-3-line text-white text-[32px]"></i>
                </div>
              </div>

              <h2 className="text-[#00585E] text-[28px] font-bold text-center leading-[34px] tracking-[-0.5px] mb-2 w-full">
                Do you have a specific target in mind?
              </h2>
              <p className="text-[#5A5A5A] text-[16px] mb-10 w-full text-center">Pick an option</p>

              <div className="w-full flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setPlanType("planin")}
                  className={`cursor-pointer w-full p-[20px] rounded-[16px] border-[1.5px] text-left transition-all duration-300 ${
                    planType === "planin"
                      ? "bg-white border-[#00585E] shadow-[0_8px_24px_rgba(0,88,94,0.12)] -translate-y-0.5"
                      : "bg-[#FCFCFC] border-[#EBEBEB] hover:border-[#00585E]/30 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <h3 className="text-[#111111] font-bold text-[17px] mb-1">Yes, I have a target in mind</h3>
                  <p className="text-[#5A5A5A] text-[14px] leading-[20px]">
                    Build your own investment plan for whatever matters to you most.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType("savein")}
                  className={`cursor-pointer w-full p-[20px] rounded-[16px] border-[1.5px] text-left transition-all duration-300 ${
                    planType === "savein"
                      ? "bg-white border-[#00585E] shadow-[0_8px_24px_rgba(0,88,94,0.12)] -translate-y-0.5"
                      : "bg-[#FCFCFC] border-[#EBEBEB] hover:border-[#00585E]/30 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <h3 className="text-[#111111] font-bold text-[17px] mb-1">No, I just want to set funds aside</h3>
                  <p className="text-[#5A5A5A] text-[14px] leading-[20px]">Save for what matters to you most</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white border border-[#F0F0F0] p-1 rounded-[20px] mb-8 shadow-sm">
                <div className="bg-[#FF4B4B] w-[64px] h-[64px] rounded-[16px] flex flex-col items-center justify-start overflow-hidden pt-1 relative">
                  <div className="w-full flex justify-evenly px-2 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-[3px] h-[6px] bg-white rounded-full"></div>
                    ))}
                  </div>
                  <div className="bg-white w-full flex-1 rounded-b-[12px] p-1.5 grid grid-cols-4 gap-1">
                     {[...Array(12)].map((_, i) => (
                       <div key={i} className={`h-[4px] rounded-sm ${i === 6 ? 'bg-[#FF4B4B] ring-2 ring-[#FF4B4B]/30' : 'bg-[#EBEBEB]'}`}></div>
                     ))}
                  </div>
                </div>
              </div>

              <h2 className="text-[#00585E] text-[28px] font-bold text-center leading-[34px] tracking-[-0.5px] mb-2 w-full">
                What would you like to call this?
              </h2>
              <p className="text-[#5A5A5A] text-[16px] mb-10 w-full text-center">Enter goal name</p>

              <div className="w-full">
                <div className="bg-white rounded-[16px] px-[20px] py-[18px] border border-[#EBEBEB] focus-within:border-[#00585E] transition-all shadow-sm">
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Dream Car, Vacation..."
                    className="bg-transparent w-full text-[17px] font-semibold text-[#111111] outline-none placeholder-[#A0A0A0]"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 w-full bg-[#F9F9F9]/80 backdrop-blur-md border-t border-[#F0F0F0] px-[20px] py-[16px] pb-[32px] md:pb-[20px] z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
          <div className="max-w-[552px] mx-auto flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="w-[60px] h-[60px] flex items-center justify-center bg-white rounded-[16px] border border-[#EBEBEB] shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:bg-[#F9F9F9] transition-all flex-shrink-0"
            >
              <i className="ri-arrow-left-line text-[#E77731] text-[24px]"></i>
            </button>
            
            <button
              onClick={handleContinue}
              disabled={(step === 1 && !planType) || (step === 2 && !planName.trim())}
              className="flex-1 h-[60px] bg-[#00585E] text-white rounded-[16px] font-bold text-[18px] shadow-[0_8px_20px_rgba(0,88,94,0.2)] hover:shadow-[0_12px_24px_rgba(0,88,94,0.3)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CustomPlanModal;
