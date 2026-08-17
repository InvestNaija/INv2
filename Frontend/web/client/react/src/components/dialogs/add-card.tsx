import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Button from "../atoms/buttons";

interface AddCardModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onProceed: () => void;
  isLoading?: boolean;
}

const AddCardModal: React.FC<AddCardModalProps> = ({
  open,
  setOpen,
  onProceed,
  isLoading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0, 20, 25, 0.4)" },
        },
        paper: {
          sx: {
            borderRadius: { xs: "24px", sm: "32px" },
            padding: "12px",
            margin: { xs: "16px", sm: "32px" },
            maxHeight: { xs: "calc(100dvh - 32px)", sm: "calc(100% - 64px)" },
            boxShadow: "0px 24px 64px rgba(0, 0, 0, 0.16), inset 0px 1px 2px rgba(255,255,255,0.5)",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
            overflowY: "auto",
            overflowX: "visible",
          },
        },
      }}
    >
      <div className="flex justify-end p-[4px] sm:p-[8px]">
        <IconButton
          onClick={() => setOpen(false)}
          className="text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors rounded-full w-[36px] h-[36px] flex items-center justify-center active:scale-90"
          size="small"
        >
          <i className="ri-close-line text-[22px] sm:text-[24px]"></i>
        </IconButton>
      </div>

      <DialogContent className="px-[20px] sm:px-[32px] pb-[28px] sm:pb-[40px] pt-[4px] sm:pt-[12px] overflow-visible">
        <div className="flex flex-col items-center text-center">

          {/* World-Class Animated Card Icon Container */}
          <div className="relative flex items-center justify-center w-[84px] h-[84px] sm:w-[112px] sm:h-[112px] mb-[24px] sm:mb-[36px]">
            {/* Outer Glow & Rings */}
            <div className="absolute inset-0 bg-[#00585E] opacity-[0.08] blur-[24px] rounded-full scale-[1.5]"></div>
            <div className="absolute inset-0 rounded-[32px] border border-[#00585E]/10 scale-[1.25] rotate-3"></div>
            <div className="absolute inset-0 rounded-[32px] border border-[#00585E]/5 scale-[1.45] -rotate-3"></div>

            {/* Center Premium Pod */}
            <div className="relative flex items-center justify-center w-full h-full rounded-[24px] sm:rounded-[32px] bg-gradient-to-b from-white to-[#F1F5F9] shadow-[0_12px_24px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,1)] border border-[#E2E8F0] z-10 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

              {/* Floating Cards Graphic */}
              <div className="relative w-[48px] h-[48px] sm:w-[64px] sm:h-[64px]">
                {/* Back Light Card */}
                <div className="absolute top-[3px] right-[1px] w-[34px] h-[25px] sm:top-[4px] sm:right-[2px] sm:w-[46px] sm:h-[34px] rounded-[8px] bg-gradient-to-tr from-[#E2E8F0] to-[#FFFFFF] border border-[#CBD5E1] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transform rotate-12 transition-transform duration-500 hover:rotate-12 hover:translate-x-1"></div>

                {/* Front Dark Card (Brand) */}
                <div className="absolute bottom-[3px] left-[1px] w-[40px] h-[28px] sm:bottom-[4px] sm:left-[2px] sm:w-[54px] sm:h-[38px] rounded-[8px] bg-gradient-to-br from-[#004A4F] to-[#002D30] border border-[#00585E] shadow-[0_8px_16px_rgba(0,88,94,0.3)] transform -rotate-6 flex flex-col justify-between p-[5px] sm:p-[6px] z-20">
                  <div className="absolute -right-[12px] -top-[12px] w-[40px] h-[40px] rounded-full bg-white/10 blur-[8px]"></div>
                  <div className="w-[10px] h-[8px] sm:w-[12px] sm:h-[10px] bg-gradient-to-br from-[#FDE68A] to-[#D4AF37] rounded-[3px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></div>
                  <div className="flex gap-[3px] justify-end">
                     <div className="w-[6px] h-[6px] sm:w-[8px] sm:h-[8px] rounded-full bg-[#EF4444] opacity-90"></div>
                     <div className="w-[6px] h-[6px] sm:w-[8px] sm:h-[8px] rounded-full bg-[#F59E0B] opacity-90 -ml-[4px]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-[22px] sm:text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#0F0F0F] to-[#475569] tracking-tight mb-[10px] sm:mb-[16px] leading-[1.25] sm:leading-[1.2] px-[8px]">
            Adding a new card
          </h2>

          <p className="text-[13px] sm:text-[16px] leading-[20px] sm:leading-[26px] text-[#64748B] font-medium max-w-[360px] mb-[28px] sm:mb-[40px]">
            We will debit <strong className="text-[#00585E]">₦50</strong> to your card and add it to your IN Wallet.
            This will become your default card, but you can always change it later.
          </p>

          <div className="flex w-full gap-[12px] sm:gap-[16px]">
            <Button
              variant="empty"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1 rounded-[16px] py-[14px] sm:py-[16px] text-[14px] sm:text-[16px] font-bold border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] hover:border-[#94A3B8] active:scale-[0.98] transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={onProceed}
              isLoading={isLoading}
              className="flex-1 rounded-[16px] py-[14px] sm:py-[16px] text-[14px] sm:text-[16px] font-bold bg-gradient-to-r from-[#00585E] to-[#004A4F] text-white shadow-[0_8px_20px_rgba(0,88,94,0.25)] hover:shadow-[0_12px_24px_rgba(0,88,94,0.35)] hover:from-[#006A70] hover:to-[#00585E] active:scale-[0.98] transition-all"
            >
              Proceed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardModal;
