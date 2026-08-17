import { Dialog, type DialogProps } from "@mui/material";
import formatCurrency from "../../hooks/FormatCurrency";
import { useUser } from "../../contexts/userContext";
import {
  isCreditLikeTransaction,
  type TransactionLike,
} from "../../hooks/transactionHelpers";

export type { TransactionLike };

interface TransactionDetailsProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
  transaction: TransactionLike | null;
}

// Border/text color per transaction status, so success/failed/pending read
// at a glance instead of all looking like plain muted text.
const STATUS_STYLES: Record<string, string> = {
  success: "border-[#44A185] text-[#44A185]",
  failed: "border-[#E5333E] text-[#E5333E]",
  abandoned: "border-[#E77731] text-[#E77731]",
  pending: "border-[#E77731] text-[#E77731]",
};
const DEFAULT_STATUS_STYLE = "border-[#BFBFBF] text-(--text-content-muted)";

// A single label/value row in the detail list, with a divider beneath.
const DetailRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-[12px] border-b border-[#F4F4F4] last:border-b-0">
      <span className="text-[var(--text-content-muted)] text-[13px] leading-[18px] font-medium shrink-0">
        {label}
      </span>
      <span className="text-[var(--text-content-default)] text-[13px] leading-[18px] font-semibold text-right break-words max-w-[70%]">
        {value}
      </span>
    </div>
  );
};

const TransactionDetails = ({
  openDialog,
  setDialog,
  transaction,
}: TransactionDetailsProps) => {
  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setDialog(false);
    }
  };

  const { currentUser } = useUser();
  const showBalance = currentUser?.show_balance ?? true;

  if (!transaction) return null;

  const isCredit = isCreditLikeTransaction(transaction);
  const statusStyle =
    STATUS_STYLES[transaction.status.toLowerCase()] ?? DEFAULT_STATUS_STYLE;

  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(0px)",
            opacity: "0.5",
          },
        },
        paper: {
          sx: {
            backgroundColor: "#fff",
            borderRadius: "24px",
            padding: "24px",
            width: "420px",
            maxWidth: "100%",
          },
        },
      }}
    >
      <div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-content-default)] text-[16px] leading-[24px] font-semibold">
            Transaction details
          </span>
          <span
            className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px] hover:bg-[#F0F0F0] transition-colors"
            onClick={() => setDialog(false)}
          >
            <i className="ri-close-fill text-[20px] leading-[24px]"></i>
          </span>
        </div>

        <div className="flex flex-col items-center mt-[24px]">
          <div
            className={`flex h-[56px] w-[56px] items-center justify-center rounded-full ${
              isCredit ? "bg-[#E7F5EE]" : "bg-[#FDEAEC]"
            }`}
          >
            <i
              className={
                isCredit
                  ? "ri-arrow-left-down-line text-[24px] text-[#44A185]"
                  : "ri-arrow-right-up-line text-[24px] text-[#E5333E]"
              }
            ></i>
          </div>
          <span
            className={`mt-[12px] text-[24px] leading-[32px] font-semibold ${
              isCredit ? "text-[#44A185]" : "text-[#E5333E]"
            }`}
          >
            {isCredit ? "+" : "-"}
            {showBalance
              ? formatCurrency(transaction.amount, transaction.currency || "NGN")
              : "₦••••"}
          </span>
          <span
            className={`mt-[8px] inline-flex items-center px-[10px] py-[2px] rounded-[99px] border text-[12px] leading-[16px] font-semibold capitalize ${statusStyle}`}
          >
            {transaction.status}
          </span>
        </div>

        <div className="text-center mt-[24px] text-[var(--text-content-default)] text-[14px] leading-[20px] font-medium break-words break-all px-4">
          {transaction.description}
        </div>

        <div className="mt-[16px] overflow-hidden">
          <DetailRow label="Reference" value={transaction.reference || (transaction as any).transaction_ref} />
          <DetailRow label="Type" value={transaction.type} />
          <DetailRow label="Source" value={transaction.source} />
          <DetailRow label="Channel" value={transaction.channel} />
          <DetailRow label="Module" value={transaction.module} />
          <DetailRow
            label="Date"
            value={(() => {
              const dateVal = transaction.createdAt || (transaction as any).created_at || (transaction as any).date;
              if (!dateVal) return null;
              return new Date(dateVal).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });
            })()}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default TransactionDetails;
