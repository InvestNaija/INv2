import { Dialog, type DialogProps } from "@mui/material";
import { useState } from "react";
import BVN, { type BVNDTO } from "./bvn";
import PersonalDetails, { type PersonalDetailsDTO } from "./personal-details";
import Others, { type OthersDTO } from "./others";
import BankAccount, { type BankAccountDTO } from "./bank-account";
import type { KINDTO } from "./kin";
import KIN from "./kin";
import { useUser } from "../../../contexts/userContext";

const TOTAL_STEPS = 5;

// One entry per step — same circular-ring stepper language as
// create-minor-account.tsx's StepRing, so every multi-step dialog in the
// app reads as one product. Each step's own icon badge (rendered below the
// header) is recolored to match its ring here too.
const KYC_STEPS = [
  { icon: "ri-bank-card-line", from: "#FF9B5E", to: "#E77731", title: "Verify BVN" },
  { icon: "ri-user-line", from: "#5EC8CD", to: "#00868D", title: "About You" },
  { icon: "ri-bank-line", from: "#6FA8F5", to: "#3182CE", title: "Bank Account" },
  { icon: "ri-group-line", from: "#B794F4", to: "#805AD5", title: "Next of Kin" },
  { icon: "ri-briefcase-line", from: "#68D391", to: "#38A169", title: "Others" },
] as const;

interface MasterFormData {
  bvn: string;
  mothersMaidenName: string;
  placeOfBirth: string;
  occupation: string;
  sourceOfIncome: string;
  bankName: string;
  bankAccountNumber: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  nextOfKinAddress: string;
}

interface AdditionalKycProps {
  setAdditionalKycDialog: (open: boolean) => void;
  openAdditionalKycDialog: boolean;
}

interface KycTaskProps {
  icon: string;
  title: string;
  description: string;
  duration: string;
}

/**
 * KycTask component represents a single pending KYC requirement in the intro screen.
 * Displays an icon, title, description, and the estimated time to complete.
 */
const KycTask = ({ icon, title, description, duration }: KycTaskProps) => (
  <div className="group flex items-center gap-3 rounded-[18px] border border-[#F0F0F0] bg-white px-[14px] py-[12px] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#DCEEEF] hover:shadow-[0_8px_20px_rgba(0,88,94,0.08)] cursor-pointer">
    <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E5F5F6] to-[#D3EEF0] transition-transform duration-200 group-hover:scale-105">
      <i className={`${icon} text-[19px] text-[#00727A]`}></i>
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[14px] font-semibold text-[#0F0F0F] truncate">{title}</p>
      <p className="text-[12px] text-[#5A5A5A] truncate">{description}</p>
    </div>
    <div className="flex shrink-0 items-center gap-[4px] rounded-full bg-[#F5F5F5] border border-[#EBEBEB] px-[10px] py-[6px] transition-all duration-200 group-hover:bg-[#E5F5F6] group-hover:border-[#D3EEF0]">
      <i className="ri-time-line text-[12px] text-[#00727A]"></i>
      <span className="text-[11px] font-bold text-[#00727A] whitespace-nowrap">{duration}</span>
    </div>
  </div>
);

interface StepHeaderProps {
  step: number;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * StepHeader displays progress tracking at the top of each KYC form step.
 * Allows the user to navigate backward or skip the current step.
 */
const StepHeader = ({ step, onBack, onSkip }: StepHeaderProps) => {
  const meta = KYC_STEPS[step - 1];
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur-sm px-[20px] py-[14px] border-b border-[#F4F4F4]">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-[#5A5A5A] transition-all hover:bg-[#EBEBEB] active:scale-90 cursor-pointer"
      >
        <i className="ri-arrow-left-s-line text-[22px]"></i>
      </button>

      <div className="inline-flex items-center gap-[10px] bg-white px-[14px] py-[6px] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
        <div className="relative h-[30px] w-[30px] shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <defs>
              <linearGradient id={`kyc-step-gradient-${step}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={meta.from} />
                <stop offset="100%" stopColor={meta.to} />
              </linearGradient>
            </defs>
            <path
              className="text-[#00585E]/10"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              strokeDasharray={`${(step / TOTAL_STEPS) * 100}, 100`}
              strokeLinecap="round"
              strokeWidth="4"
              stroke={`url(#kyc-step-gradient-${step})`}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#111111]">{step}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-[#9B9B9B] uppercase tracking-wider mb-0.5">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-[12px] font-bold text-[#111111] leading-none">{meta.title}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="rounded-full px-[10px] py-[6px] text-[13px] font-semibold text-[#E77731] transition-all hover:bg-[#FFF3E0] active:scale-90 cursor-pointer"
      >
        Skip
      </button>
    </div>
  );
};

/**
 * Main AdditionalKyc dialog component managing a multi-step KYC data collection flow.
 */
const AdditionalKyc = (props: AdditionalKycProps) => {
  const { currentUser, refetchUser } = useUser();

  const [activeStep, setActiveStep] = useState(0);

  const isBvnDone = Boolean(currentUser?.bvn);
  const isPersonalDone =
    Boolean(currentUser?.mothersMaidenName) && Boolean(currentUser?.placeOfBirth);
  const isOthersDone = Boolean(currentUser?.occupation);
  const isBankDone = Boolean(currentUser?.nuban);
  const isKinDone = Boolean(currentUser?.nextOfKinName);
  
  const stepCompletion = [isBvnDone, isPersonalDone, isBankDone, isKinDone, isOthersDone];

  /** Closes the KYC dialog */
  const handleClose: DialogProps["onClose"] = () => {
    props.setAdditionalKycDialog(false);
  };
  const closeDialog = () => props.setAdditionalKycDialog(false);

  // The "You're all set!" screen (step 6) is only earned when every single
  // requirement is actually done — finishing whichever step happened to be
  // last in this particular call chain doesn't mean the others are too
  // (e.g. a skipped BVN step earlier shouldn't be masked by completing
  // Others last).
  const advanceToStep = (fromStep: number) => {
    const allComplete = stepCompletion.every(Boolean);

    if (fromStep > TOTAL_STEPS) {
      setActiveStep(allComplete ? 6 : 1);
      return;
    }

    for (let step = fromStep; step <= TOTAL_STEPS; step++) {
      if (!stepCompletion[step - 1]) {
        setActiveStep(step);
        return;
      }
    }

    setActiveStep(allComplete ? 6 : 1);
  };

  /** Skips the current step and moves to the next */
  const skipStep = () => {
    advanceToStep(activeStep + 1);
  };

  /** Navigates backward to the most recent incomplete step, or intro screen */
  const goBack = () => {
    for (let step = activeStep - 1; step >= 1; step--) {
      if (!stepCompletion[step - 1]) {
        setActiveStep(step);
        return;
      }
    }
    setActiveStep(0);
  };

  const [formData, setFormData] = useState<Partial<MasterFormData>>({
    bvn: "",
    mothersMaidenName: "",
    placeOfBirth: "",
    occupation: "",
    sourceOfIncome: "",
    bankName: "",
    bankAccountNumber: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelationship: "",
    nextOfKinAddress: "",
  });

  const handleBVNSubmit = async (bvnData: BVNDTO) => {
    setFormData((prev) => ({ ...prev, ...bvnData }));
    await refetchUser();
    advanceToStep(2);
  };

  const handlePersonalDetailsSubmit = async (personalData: PersonalDetailsDTO) => {
    setFormData((prev) => ({ ...prev, ...personalData }));
    await refetchUser();
    advanceToStep(3);
  };

  const handleAccountSubmit = async (accountData: BankAccountDTO) => {
    setFormData((prev) => ({ ...prev, ...accountData }));
    await refetchUser();
    advanceToStep(4);
  };

  const handleKINSubmit = async (kinData: KINDTO) => {
    setFormData((prev) => ({ ...prev, ...kinData }));
    await refetchUser();
    advanceToStep(5);
  };

  const handleOthersSubmit = async (othersData: OthersDTO) => {
    setFormData((prev) => ({ ...prev, ...othersData }));
    await refetchUser();
    advanceToStep(6);
  };

  return (
    <>
    <style>{`
      @keyframes kycStepIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <Dialog
      open={props.openAdditionalKycDialog}
      onClose={handleClose}
      slotProps={{
        transition: { onEnter: () => setActiveStep(0) },
        backdrop: {
          sx: {
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(15, 15, 15, 0.4)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "#fff",
            borderRadius: { xs: "24px", sm: "32px" },
            width: "520px",
            maxWidth: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" },
            maxHeight: { xs: "calc(100dvh - 24px)", sm: "88vh" },
            margin: 0,
            border: "1px solid #F4F4F4",
            boxShadow: "0px 32px 70px rgba(0, 0, 0, 0.16)",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        },
      }}
    >
      {activeStep === 0 && (
        <div className="pb-[32px] animate-[kycStepIn_0.35s_ease]">
          <div className="sticky top-0 z-10 bg-gradient-to-b from-[#FFF3E0] to-white px-[28px] pt-[20px] pb-[28px]">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#5A5A5A] backdrop-blur-sm transition-all hover:bg-white active:scale-90 cursor-pointer"
              >
                <i className="ri-close-line text-[18px]"></i>
              </button>
            </div>

            <div className="text-center mt-[8px]">
              <span className="relative flex h-[72px] w-[72px] mx-auto items-center justify-center rounded-full bg-gradient-to-br from-[#F0935C] to-[#E77731] shadow-[0_12px_28px_rgba(231,119,49,0.35)]">
                <i className="ri-shield-keyhole-line text-[32px] text-white"></i>
              </span>
              <h3 className="mt-[20px] text-[#0F0F0F] text-[24px] font-bold leading-[32px] tracking-[-0.3px]">
                Additional KYC needed
              </h3>
              <p className="mt-[6px] text-[#5A5A5A] text-[14px] leading-[20px] max-w-[340px] mx-auto">
                A few more details are required to unlock trading, investing and saving on your account.
              </p>
            </div>
          </div>

          <div className="px-[28px]">
            <div className="mt-[20px] flex flex-col gap-[10px]">
              {!isBvnDone && (
                <KycTask
                  icon="ri-bank-card-line"
                  title="BVN Verification"
                  description="Confirm your identity"
                  duration="1 Min"
                />
              )}
              {!isPersonalDone && (
                <KycTask
                  icon="ri-user-line"
                  title="Personal Details"
                  description="Mother's maiden name & place of birth"
                  duration="30s"
                />
              )}
              {!isBankDone && (
                <KycTask
                  icon="ri-bank-line"
                  title="Bank Account"
                  description="Link your Nigerian bank account"
                  duration="30s"
                />
              )}
              {!isKinDone && (
                <KycTask
                  icon="ri-group-line"
                  title="Next of Kin"
                  description="Who we contact in an emergency"
                  duration="1 Min"
                />
              )}
              {!isOthersDone && (
                <KycTask
                  icon="ri-briefcase-line"
                  title="Others"
                  description="Occupation & source of income"
                  duration="30s"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => advanceToStep(1)}
              className="mt-[24px] w-full rounded-[99px] h-[56px] bg-gradient-to-r from-[#00585E] to-[#00868D] text-white font-semibold text-[15px] cursor-pointer transition-all duration-200 hover:shadow-[0_12px_28px_rgba(0,88,94,0.35)] hover:-translate-y-[1px] active:scale-[0.98] shadow-[0_8px_20px_rgba(0,88,94,0.25)]"
            >
              Get started
            </button>
            <button
              type="button"
              onClick={closeDialog}
              className="mt-[14px] w-full text-center text-[13px] font-semibold text-[#5A5A5A] hover:text-[#0F0F0F] active:scale-[0.97] transition-transform cursor-pointer"
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div key="step-1" className="pb-[40px] animate-[kycStepIn_0.3s_ease]">
          <StepHeader step={1} onBack={goBack} onSkip={skipStep} />

          <div className="text-center mt-[20px] px-[24px]">
            <span
              className="flex h-[56px] w-[56px] mx-auto items-center justify-center rounded-full shadow-[0_8px_18px_rgba(231,119,49,0.25)]"
              style={{ background: `linear-gradient(135deg, ${KYC_STEPS[0].from}, ${KYC_STEPS[0].to})` }}
            >
              <i className="ri-bank-card-line text-[24px] text-white"></i>
            </span>
            <h3 className="mt-[16px] text-[#0F0F0F] text-[22px] font-bold leading-[30px] tracking-[-0.3px]">
              Verify your BVN
            </h3>
            <p className="mt-[4px] text-[#5A5A5A] text-[13px] leading-[18px]">
              Enter your BVN to verify and confirm your identity.
            </p>
          </div>

          <BVN initialData={formData} onNext={handleBVNSubmit} />
          <div className="px-[24px]">
            <button
              type="button"
              onClick={closeDialog}
              className="mt-[14px] w-full text-center text-[13px] font-semibold text-[#5A5A5A] hover:text-[#0F0F0F] active:scale-[0.97] transition-transform cursor-pointer"
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div key="step-2" className="pb-[40px] animate-[kycStepIn_0.3s_ease]">
          <StepHeader step={2} onBack={goBack} onSkip={skipStep} />

          <div className="text-center mt-[20px] px-[24px]">
            <span
              className="flex h-[56px] w-[56px] mx-auto items-center justify-center rounded-full shadow-[0_8px_18px_rgba(0,134,141,0.25)]"
              style={{ background: `linear-gradient(135deg, ${KYC_STEPS[1].from}, ${KYC_STEPS[1].to})` }}
            >
              <i className="ri-user-line text-[24px] text-white"></i>
            </span>
            <h3 className="mt-[16px] text-[#0F0F0F] text-[22px] font-bold leading-[30px] tracking-[-0.3px]">
              A bit more about you
            </h3>
            <p className="mt-[4px] text-[#5A5A5A] text-[13px] leading-[18px]">
              Your mother's maiden name and place of birth.
            </p>
          </div>

          <PersonalDetails initialData={formData} onNext={handlePersonalDetailsSubmit} />
          <div className="px-[24px]">
            <button
              type="button"
              onClick={closeDialog}
              className="mt-[14px] w-full text-center text-[13px] font-semibold text-[#5A5A5A] hover:text-[#0F0F0F] active:scale-[0.97] transition-transform cursor-pointer"
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div key="step-3" className="pb-[40px] animate-[kycStepIn_0.3s_ease]">
          <StepHeader step={3} onBack={goBack} onSkip={skipStep} />

          <div className="text-center mt-[20px] px-[24px]">
            <span
              className="flex h-[56px] w-[56px] mx-auto items-center justify-center rounded-full shadow-[0_8px_18px_rgba(49,130,206,0.25)]"
              style={{ background: `linear-gradient(135deg, ${KYC_STEPS[2].from}, ${KYC_STEPS[2].to})` }}
            >
              <i className="ri-bank-line text-[24px] text-white"></i>
            </span>
            <h3 className="mt-[16px] text-[#0F0F0F] text-[22px] font-bold leading-[30px] tracking-[-0.3px]">
              Add bank account
            </h3>
            <p className="mt-[4px] text-[#5A5A5A] text-[13px] leading-[18px]">
              Provide your Nigerian bank account number.
            </p>
          </div>

          <BankAccount initialData={formData} onNext={handleAccountSubmit} />
          <div className="px-[24px]">
            <button
              type="button"
              onClick={closeDialog}
              className="mt-[14px] w-full text-center text-[13px] font-semibold text-[#5A5A5A] hover:text-[#0F0F0F] active:scale-[0.97] transition-transform cursor-pointer"
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div key="step-4" className="pb-[40px] animate-[kycStepIn_0.3s_ease]">
          <StepHeader step={4} onBack={goBack} onSkip={skipStep} />

          <div className="text-center mt-[20px] px-[24px]">
            <span
              className="flex h-[56px] w-[56px] mx-auto items-center justify-center rounded-full shadow-[0_8px_18px_rgba(128,90,213,0.25)]"
              style={{ background: `linear-gradient(135deg, ${KYC_STEPS[3].from}, ${KYC_STEPS[3].to})` }}
            >
              <i className="ri-group-line text-[24px] text-white"></i>
            </span>
            <h3 className="mt-[16px] text-[#0F0F0F] text-[22px] font-bold leading-[30px] tracking-[-0.3px]">
              Next of Kin
            </h3>
            <p className="mt-[4px] text-[#5A5A5A] text-[13px] leading-[18px]">
              Provide your next of kin details.
            </p>
          </div>

          <KIN initialData={formData} onNext={handleKINSubmit} />
          <div className="px-[24px]">
            <button
              type="button"
              onClick={closeDialog}
              className="mt-[14px] w-full text-center text-[13px] font-semibold text-[#5A5A5A] hover:text-[#0F0F0F] active:scale-[0.97] transition-transform cursor-pointer"
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}

      {activeStep === 5 && (
        <div key="step-5" className="pb-[40px] animate-[kycStepIn_0.3s_ease]">
          <StepHeader step={5} onBack={goBack} onSkip={skipStep} />

          <div className="text-center mt-[20px] px-[24px]">
            <span
              className="flex h-[56px] w-[56px] mx-auto items-center justify-center rounded-full shadow-[0_8px_18px_rgba(56,161,105,0.25)]"
              style={{ background: `linear-gradient(135deg, ${KYC_STEPS[4].from}, ${KYC_STEPS[4].to})` }}
            >
              <i className="ri-briefcase-line text-[24px] text-white"></i>
            </span>
            <h3 className="mt-[16px] text-[#0F0F0F] text-[22px] font-bold leading-[30px] tracking-[-0.3px]">
              Others
            </h3>
            <p className="mt-[4px] text-[#5A5A5A] text-[13px] leading-[18px]">
              Your occupation and source of income.
            </p>
          </div>

          <Others initialData={formData} onNext={handleOthersSubmit} />
          <div className="px-[24px]">
            <button
              type="button"
              onClick={closeDialog}
              className="mt-[14px] w-full text-center text-[13px] font-semibold text-[#5A5A5A] hover:text-[#0F0F0F] active:scale-[0.97] transition-transform cursor-pointer"
            >
              I'll do this later
            </button>
          </div>
        </div>
      )}
      {activeStep === 6 && (
        <div key="step-6" className="relative pb-[48px] pt-[40px] animate-[kycStepIn_0.4s_cubic-bezier(0.16,1,0.3,1)] text-center px-[32px] overflow-hidden">
          
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#00868D]/5 rounded-full blur-[60px] pointer-events-none"></div>

          <div className="relative flex h-[110px] w-[110px] mx-auto items-center justify-center rounded-full bg-gradient-to-br from-[#E5F5F6] to-[#D3EEF0] shadow-[0_12px_32px_rgba(0,114,122,0.2)] mb-[28px] animate-bounce-in">
            {/* Inner ring for extra depth */}
            <div className="absolute inset-2 rounded-full border border-white/60"></div>
            <i className="ri-shield-check-fill text-[52px] text-[#00727A] drop-shadow-sm"></i>
            
            {/* Sparkle icons for a celebratory feel */}
            <i className="ri-sparkling-fill absolute -top-1 -right-2 text-[20px] text-[#E77731] animate-pulse"></i>
            <i className="ri-sparkling-fill absolute bottom-2 -left-3 text-[16px] text-[#00868D] animate-pulse delay-150"></i>
          </div>

          <h3 className="text-[#0F0F0F] text-[28px] font-extrabold leading-[36px] tracking-[-0.5px]">
            You're all set!
          </h3>
          
          <p className="mt-[12px] text-[#555] text-[15px] leading-[24px] max-w-[340px] mx-auto mb-[40px]">
            Your KYC is fully completed. You now have unrestricted access to save, invest, and grow your wealth.
          </p>

          <button
            onClick={closeDialog}
            className="w-full rounded-[99px] h-[56px] bg-gradient-to-r from-[#00585E] to-[#00868D] text-white text-[16px] font-bold tracking-[0.2px] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(0,88,94,0.3)] hover:-translate-y-[2px] active:scale-[0.98] cursor-pointer relative overflow-hidden group"
          >
            <span className="relative z-10">Continue</span>
            {/* Button hover glare effect */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
          </button>
        </div>
      )}
    </Dialog>
    </>
  );
};

export default AdditionalKyc;
