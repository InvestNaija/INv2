import { Dialog, type DialogProps } from "@mui/material";
import Button from "../atoms/buttons";

interface OrderSuccessProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderType: string;
  quantity: number;
  securitySymbol: string;
}

const OrderSuccess = ({
  open,
  setOpen,
  orderType,
  quantity,
  securitySymbol,
}: OrderSuccessProps) => {
  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
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
        <div className="flex justify-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-[#E7F5EE]">
            <i className="ri-checkbox-circle-fill text-[32px] text-[#44A185]"></i>
          </div>
        </div>

        <div className="text-center mt-[24px] text-[22px] text-(--text-content-default) font-bold leading-[28px] tracking-[-0.2px]">
          <span>{orderType} order placed</span>
        </div>
        <div className="text-center mt-[10px] text-[16px] text-(--text-content-subtle) font-medium leading-[24px]">
          <span>
            Your {orderType.toLowerCase()} order for{" "}
            <span className="font-bold text-(--text-content-default)">
              {quantity.toLocaleString("en-US")} unit
              {quantity === 1 ? "" : "s"} of {securitySymbol}
            </span>{" "}
            has been submitted and is now being processed.
          </span>
        </div>

        <div className="mt-[44px]">
          <Button
            variant="primary"
            disabled={false}
            isLoading={false}
            className="rounded-[99px] h-[56px]"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default OrderSuccess;
