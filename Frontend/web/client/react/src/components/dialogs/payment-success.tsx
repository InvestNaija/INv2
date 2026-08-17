import { Dialog, type DialogProps } from "@mui/material";
import Button from "../atoms/buttons";
import formatCurrency from "../../hooks/FormatCurrency";

interface PaymentSuccessProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  amount?: number;
  currency?: string;
  title?: string;
  message?: string;
}

const PaymentSuccess = ({
  open,
  setOpen,
  amount,
  currency = "NGN",
  title = "Payment successful",
  message,
}: PaymentSuccessProps) => {
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
          <span>{title}</span>
        </div>
        <div className="text-center mt-[10px] text-[16px] text-(--text-content-subtle) font-medium leading-[24px]">
          <span>
            {message ? (
              message
            ) : amount !== undefined ? (
              <>
                Your payment of{" "}
                <span className="font-bold text-(--text-content-default)">
                  {formatCurrency(amount, currency, currency === "USD" ? "en-US" : "en-NG")}
                </span>{" "}
                was successful and your account is being funded.
              </>
            ) : (
              "Payment was successful and your account is being funded."
            )}
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

export default PaymentSuccess;
