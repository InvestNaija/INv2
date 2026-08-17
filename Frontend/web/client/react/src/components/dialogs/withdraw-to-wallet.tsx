import { Dialog, type DialogProps } from "@mui/material";
import { useRef, useState } from "react";
import Button from "../atoms/buttons";
import formatCurrency from "../../hooks/FormatCurrency";

const QUICK_AMOUNTS = [1000, 5000, 10000, 50000, 100000, 500000];

interface WithdrawToWalletProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
  // The trade portfolio's available cash — the most that can be withdrawn
  // out to the wallet.
  availableBalance: number;
  isSubmitting?: boolean;
  onProceed: (amount: number) => void;
}

const WithdrawToWallet = ({
  openDialog,
  setDialog,
  availableBalance,
  isSubmitting = false,
  onProceed,
}: WithdrawToWalletProps) => {
  const [amountInput, setAmountInput] = useState("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => setAmountInput("");

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setDialog(false);
    }
  };

  // Only digits and a single decimal point — keeps the big amount display
  // from ever landing on a value that can't be parsed back to a number.
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setAmountInput(sanitized);
  };

  const amount = Number(amountInput) || 0;
  const exceedsBalance = amount > 0 && amount > availableBalance;

  const handleProceed = () => {
    if (amount <= 0 || exceedsBalance || isSubmitting) return;
    onProceed(amount);
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      slotProps={{
        transition: {
          onEnter: resetForm,
          // See payment-gateway.tsx — focus again once MUI's Dialog enter
          // transition settles, since its own focus management can steal
          // focus back after the native `autoFocus` attribute fires.
          onEntered: () => amountInputRef.current?.focus(),
        },
        backdrop: {
          sx: { backdropFilter: "blur(0px)", opacity: "0.5" },
        },
        paper: {
          sx: {
            backgroundColor: "var(--surface-default)",
            borderRadius: "24px",
            width: { xs: "100%", sm: "560px" },
            maxWidth: "calc(100% - 32px)",
            margin: { xs: "16px", sm: "32px" },
          },
        },
      }}
    >
      <div className="flex items-center justify-between px-[20px] py-[16px] sm:px-[24px] border-b border-(--border-default)">
        <button
          type="button"
          onClick={() => setDialog(false)}
          className="text-(--text-content-default) cursor-pointer bg-(--surface-subtle) border border-(--border-default) rounded-[999px] px-[9px] py-[6px]"
        >
          <i className="ri-close-fill text-[24px] leading-[28px]"></i>
        </button>

        <h2 className="text-[18px] font-bold text-(--text-content-default)">
          Withdraw to wallet
        </h2>

        <Button
          type="button"
          variant="primary"
          disabled={amount <= 0 || exceedsBalance}
          isLoading={isSubmitting}
          className="!w-auto rounded-[99px] h-[40px] px-[24px] !text-[14px]"
          onClick={handleProceed}
        >
          Proceed
        </Button>
      </div>

      <div className="px-[20px] py-[32px] sm:px-[32px]">
        <div className="flex justify-center">
          <div className="flex items-start w-fit">
            <span
              className={`text-[18px] font-bold leading-none mt-[6px] mr-[4px] ${
                exceedsBalance
                  ? "text-(--text-content-critical)"
                  : "text-(--text-content-muted)"
              }`}
            >
              ₦
            </span>
            <input
              ref={amountInputRef}
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="0.00"
              autoFocus
              autoComplete="off"
              name="withdraw-to-wallet-amount"
              size={amountInput.length || 4}
              className={`bg-transparent border-none outline-none text-left text-[48px] font-bold leading-none placeholder:text-(--text-content-muted) caret-[#00585E] ${
                exceedsBalance
                  ? "text-(--text-content-critical)"
                  : "text-(--text-content-default)"
              }`}
            />
          </div>
        </div>
        {exceedsBalance && (
          <p className="mt-[8px] text-center text-[13px] text-(--text-content-critical) font-medium">
            Amount exceeds your available balance
          </p>
        )}

        <div className="mt-[28px] flex gap-[10px] overflow-x-auto pb-[4px]">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <button
              type="button"
              key={quickAmount}
              onClick={() => setAmountInput(String(quickAmount))}
              className={`shrink-0 whitespace-nowrap rounded-[999px] px-[18px] py-[10px] text-[14px] font-bold cursor-pointer transition-all duration-150 ${
                amount === quickAmount
                  ? "scale-[1.04] bg-[#00585E] text-white shadow-[0_4px_14px_rgba(0,88,94,0.3)]"
                  : "border-2 border-[#DCDCDC] bg-(--surface-subtle) text-(--text-content-default) hover:border-(--text-content-default) hover:bg-white"
              }`}
            >
              {formatCurrency(quickAmount, "NGN", "en-NG")}
            </button>
          ))}
        </div>

        <div className="mt-[28px] flex items-center gap-[14px] rounded-[16px] border border-(--border-default) px-[20px] py-[16px]">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] border border-[#F6D3AE] bg-[#FDEEE1] text-[20px] text-[#E77731]">
            <i className="ri-wallet-3-fill"></i>
          </div>
          <div>
            <div className="text-[15px] font-bold text-(--text-content-default)">
              Available Balance
            </div>
            <div className="mt-[2px] text-[15px] text-(--text-content-default) font-bold">
              {formatCurrency(availableBalance, "NGN", "en-NG")}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default WithdrawToWallet;
