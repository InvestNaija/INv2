import { Dialog, type DialogProps } from "@mui/material";
import Button from "../atoms/buttons";

interface CancelTradeOrderConfirmationProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  orderLabel?: string;
}

const CancelTradeOrderConfirmation = (
  props: CancelTradeOrderConfirmationProps,
) => {
  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      props.setOpen(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      onClose={handleDialogClose}
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(0px)", opacity: "0.5" },
        },
        paper: {
          sx: {
            backgroundColor: "#fff",
            borderRadius: "24px",
            padding: "34px 24px",
          },
        },
      }}
    >
      <div className="md:w-md xl:w-md lg:w-md xs:w-sm sm:w-sm w-sm">
        <div className="flex justify-start">
          <span
            className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px]"
            onClick={() => props.setOpen(false)}
          >
            <i className="ri-close-fill text-[24px] leading-[28px]"></i>
          </span>
        </div>

        <div className="mt-[8px]">
          <div className="flex justify-center">
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-[#FFECDF]">
              <i className="ri-close-circle-line text-[32px] text-[#CC1A30]"></i>
            </div>
          </div>

          <div className="text-center mt-[24px] text-[20px] text-(--text-content-default) font-semibold leading-[28px]">
            <span>Cancel this trade order?</span>
          </div>
          <div className="text-center text-[16px] text-(--text-content-default) font-normal leading-[24px]">
            <span>
              Are you sure you want to cancel{" "}
              {props.orderLabel ? (
                <span className="font-semibold">{props.orderLabel}</span>
              ) : (
                "this order"
              )}
              ? This can't be undone.
            </span>
          </div>

          <div className="mt-[44px]">
            <Button
              variant="danger"
              disabled={props.isLoading}
              isLoading={props.isLoading}
              className="rounded-[99px] h-[56px] xs:w-sm sm:w-sm w-sm lg:w-md xl:w-md"
              onClick={props.onConfirm}
            >
              Cancel Order
            </Button>
            <div className="mt-[36px] text-center">
              <a
                onClick={() => props.setOpen(false)}
                className="cursor-pointer py-[16px] text-center text-[16px] text-(--text-content-default) font-semibold leading-[24px] tracking-[0.2px]"
              >
                Go back
              </a>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CancelTradeOrderConfirmation;
