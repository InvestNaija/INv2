import { Dialog, type DialogProps } from "@mui/material";
import Slide from "@mui/material/Slide";
import { forwardRef } from "react";
import type { TransitionProps } from "@mui/material/transitions";
import Button from "../atoms/buttons";

interface MarketClosedProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
}

const SlideUpTransition = forwardRef(function SlideUpTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TradingHoursRow = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex justify-between items-center py-[16px] px-[20px]">
    <span className="text-[15px] text-(--text-content-muted) font-medium">
      {label}
    </span>
    <span
      className={`text-[15px] font-bold ${highlight ? "text-[#00727A]" : "text-(--text-content-default)"}`}
    >
      {value}
    </span>
  </div>
);

const MarketClosed = ({ openDialog, setDialog }: MarketClosedProps) => {
  const handleClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setDialog(false);
    }
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleClose}
      slots={{ transition: SlideUpTransition }}
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(0px)", opacity: "0.5" },
        },
        paper: {
          sx: {
            position: "fixed",
            bottom: 0,
            margin: 0,
            width: "100%",
            maxWidth: "480px",
            borderRadius: "24px 24px 0 0",
            backgroundColor: "var(--surface-default)",
            padding: "12px 0 24px",
          },
        },
      }}
    >
      <div className="flex justify-center">
        <span className="h-[4px] w-[36px] rounded-full bg-(--border-default)"></span>
      </div>

      <div className="px-[24px] mt-[20px]">
        <div className="flex items-start gap-[16px]">
          <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-(--surface-subtle)">
            <i className="ri-time-line text-[24px] text-(--text-content-default)"></i>
          </span>
          <div>
            <div className="text-[18px] text-(--text-content-default) font-bold leading-[26px]">
              Market is closed
            </div>
            <div className="mt-[4px] text-[14px] text-(--text-content-muted) leading-[20px]">
              Orders placed now will execute on the next trading day
            </div>
          </div>
        </div>

        <div className="mt-[24px] rounded-[16px] bg-(--surface-subtle) overflow-hidden">
          <div className="flex justify-between items-center px-[20px] pt-[16px] pb-[8px]">
            <span className="text-[14px] text-(--text-content-default) font-bold">
              NGX trading hours
            </span>
            <span className="rounded-[999px] bg-(--surface-default) px-[10px] py-[4px] text-[12px] text-(--text-content-muted) font-medium">
              WAT • GMT+1
            </span>
          </div>

          <div className="divide-y divide-(--border-default)">
            <TradingHoursRow
              label="Mon – Fri"
              value="9:00 AM – 4:00 PM"
              highlight
            />
            <TradingHoursRow label="Weekends" value="Closed" />
            <TradingHoursRow label="Public holidays" value="Closed" />
          </div>
        </div>

        <div className="mt-[24px]">
          <Button
            variant="primary"
            className="rounded-[999px] h-[56px]"
            onClick={() => setDialog(false)}
          >
            Got it
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default MarketClosed;
