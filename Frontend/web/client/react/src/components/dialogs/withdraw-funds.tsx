import { Dialog, type DialogProps } from "@mui/material";
import Divider from "@mui/material/Divider";
import { useRef, useState } from "react";
import Button from "../atoms/buttons";
import Label from "../atoms/labels";
import Input from "../atoms/input";
import formatCurrency from "../../hooks/FormatCurrency";

interface WithdrawFundsProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
  availableBalance: number;
  isSubmitting?: boolean;
  // Called with the raw amount and plaintext password once both pass local
  // validation — encryption of the password happens one level up, closer to
  // where it's actually sent, not inside this presentational form.
  onContinue: (amount: number, password: string) => void;
}

const WithdrawFunds = ({
  openDialog,
  setDialog,
  availableBalance,
  isSubmitting = false,
  onContinue,
}: WithdrawFundsProps) => {
  const [amountInput, setAmountInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Resets the form as the dialog starts opening, so a previous attempt's
  // amount/password/error doesn't linger — done via the transition's
  // onEnter (a response to the dialog opening) rather than a render-phase
  // effect.
  const resetForm = () => {
    setAmountInput("");
    setPassword("");
    setError(null);
  };

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setDialog(false);
    }
  };

  // Only digits and a single decimal point — keeps the big amount display
  // from breaking on stray characters while still allowing free typing.
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    const sanitized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : value;
    setAmountInput(sanitized);
    setError(null);
  };

  const amount = Number(amountInput) || 0;
  // No withdrawal fee is currently charged — kept as a named constant (not
  // hardcoded inline) so it's the one place to update if that changes.
  const transactionFee = 0;
  const total = amount + transactionFee;
  // Derived live from the typed amount (not stored state), so the warning
  // and the disabled Continue button update on every keystroke instead of
  // only appearing after a submit attempt.
  const exceedsBalance = amount > availableBalance;

  const handleContinue = () => {
    if (amount <= 0) {
      setError("Enter an amount to withdraw");
      return;
    }
    if (exceedsBalance) {
      // Already shown live under the amount field — nothing more to do,
      // just block the submit.
      return;
    }
    if (!password) {
      setError("Enter your password to confirm");
      return;
    }
    onContinue(amount, password);
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      slotProps={{
        transition: {
          onEnter: resetForm,
          // See payment-gateway.tsx — MUI's Dialog focus management can
          // steal focus back after the native `autoFocus` attribute fires,
          // so this focuses again once the enter transition has settled.
          onEntered: () => amountInputRef.current?.focus(),
        },
        backdrop: {
          sx: {
            backdropFilter: "blur(0px)",
            opacity: "0.5",
          },
        },
        paper: {
          sx: {
            backgroundColor: "var(--surface-default)",
            borderRadius: "24px",
            padding: { xs: "24px 20px", sm: "34px 32px" },
            width: { xs: "100%", sm: "560px" },
            maxWidth: "calc(100% - 32px)",
            margin: { xs: "16px", sm: "32px" },
          },
        },
      }}
    >
      <div className="flex justify-end">
        <span
          className="text-(--text-content-default) cursor-pointer bg-(--surface-subtle) border border-(--border-default) rounded-[999px] px-[9px] py-[6px]"
          onClick={() => setDialog(false)}
        >
          <i className="ri-close-fill text-[24px] leading-[28px]"></i>
        </span>
      </div>

      <h2 className="mt-[8px] text-center text-[24px] font-bold text-(--text-content-default)">
        Withdraw Funds
      </h2>

      <div className="mt-[32px] flex justify-center">
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
            name="withdraw-amount"
            size={amountInput.length || 4}
            className={`bg-transparent border-none outline-none text-left text-[48px] font-bold leading-none placeholder:text-(--text-content-muted) caret-[#00585E] ${
              exceedsBalance
                ? "text-(--text-content-critical)"
                : "text-(--text-content-muted)"
            }`}
          />
        </div>
      </div>
      <div className="mt-[16px] mb-[8px] flex justify-center">
        <div className="flex items-center gap-[8px] bg-(--surface-subtle) px-[16px] py-[8px] rounded-full border border-(--border-default) shadow-xs">
          <div className="flex items-center justify-center w-[24px] h-[24px] rounded-full bg-white shadow-xs">
            <i className="ri-wallet-3-fill text-[13px] text-(--text-content-brand)"></i>
          </div>
          <span className="text-[13px] text-(--text-content-muted) font-medium">Available balance:</span>
          <span className="text-[14px] text-(--text-content-brand) font-bold ml-[2px]">
            {formatCurrency(availableBalance, "NGN")}
          </span>
        </div>
      </div>
      {exceedsBalance && (
        <p className="mt-[6px] text-center text-[13px] text-(--text-content-critical) font-medium">
          Amount exceeds your available balance
        </p>
      )}

      <div className="mt-[24px]">
        <div className="flex items-center justify-between py-[10px]">
          <span className="text-(--text-content-muted) text-[14px]">
            Transaction fee:
          </span>
          <span className="text-(--text-content-default) text-[14px] font-medium">
            {formatCurrency(transactionFee, "NGN")}
          </span>
        </div>
        <Divider />
        <div className="flex items-center justify-between py-[10px]">
          <span className="text-(--text-content-default) text-[14px] font-semibold">
            Total:
          </span>
          <span className="text-(--text-content-default) text-[14px] font-bold">
            {formatCurrency(total, "NGN")}
          </span>
        </div>
      </div>

      <div className="mt-[16px]">
        <Label name="Password" />
        <Input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
          placeholder="Enter your password to confirm"
          autoComplete="new-password"
          name="withdraw-password"
        />
      </div>

      {error && (
        <p className="mt-[12px] text-center text-[13px] text-(--text-content-critical) font-medium">
          {error}
        </p>
      )}

      <div className="mt-[28px]">
        <Button
          variant="primary"
          disabled={isSubmitting || exceedsBalance}
          isLoading={isSubmitting}
          className="rounded-[99px] h-[56px]"
          onClick={handleContinue}
        >
          Continue
        </Button>
        {/* <Button
          variant="empty"
          disabled={isSubmitting}
          isLoading={false}
          className="rounded-[99px] h-[56px] !border-(--border-default) mt-[16px]"
          onClick={() => setDialog(false)}
        >
          Back
        </Button> */}
      </div>
    </Dialog>
  );
};

export default WithdrawFunds;
