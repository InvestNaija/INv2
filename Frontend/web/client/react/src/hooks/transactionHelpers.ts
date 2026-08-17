// Shared shape of a transaction row, matching both TransactionContext's
// `Transaction` and WalletContext's `WalletTransaction` (structurally
// identical — both come from the same /transactions/my-transactions
// endpoint, just filtered differently).
export interface TransactionLike {
  id: string;
  reference: string;
  description: string;
  currency: string;
  amount: number;
  status: string;
  type: string;
  source: string;
  channel: string;
  module: string;
  post_date: string;
  createdAt: string;
}

// The API tags fund subscriptions (e.g. "Subscription to Money Market Fund
// via Paystack...") as type "debit" — technically money left the wallet,
// but from the user's perspective it's them actively investing, so it's
// shown with the same credit (green, received-style) treatment rather than
// looking like an expense. Shared by both transaction lists and the details
// modal so the styling stays consistent everywhere.
export const isCreditLikeTransaction = (transaction: TransactionLike) =>
  transaction.type === "credit" || /subscription/i.test(transaction.description);

const MAX_TRANSACTION_TITLE_LENGTH = 32;

// The API's `description` reads like "TradeIN to Wallet — ₦20.00 received
// from ... (Ref: ...)" or "Paystack wallet top-up for someone@email.com" —
// trim it down to a short, list-friendly summary: drop everything after the
// em dash, drop a trailing "for <email>", then hard-truncate as a fallback
// for anything still long. Shared by every transaction list (Overview,
// Wallet, the Transactions feature) so the same row reads identically
// wherever it's shown.
export const getTransactionTitle = (description: string) => {
  const withoutSuffix = description
    .split(" — ")[0]
    .replace(/\s+for\s+\S+@\S+$/i, "");
  return withoutSuffix.length > MAX_TRANSACTION_TITLE_LENGTH
    ? `${withoutSuffix.slice(0, MAX_TRANSACTION_TITLE_LENGTH - 1)}…`
    : withoutSuffix;
};

// post_date is a plain "YYYY-MM-DD" string — format it to match the design
// (e.g. "April 23, 2026").
export const formatTransactionDate = (postDate: string | number | Date) =>
  new Date(postDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// Hex colors (not Tailwind classes) for status text/icons rendered via MUI
// `sx` props, where arbitrary Tailwind classes don't apply. Mirrors the
// border/text pill colors used in the transaction-details modal.
export const STATUS_HEX_COLORS: Record<string, string> = {
  success: "#44A185",
  failed: "#E5333E",
  abandoned: "#E77731",
  pending: "#E77731",
};
export const DEFAULT_STATUS_HEX_COLOR = "#BFBFBF";

export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  success: { bg: "#E6F4EA", text: "#44A185" },
  successful: { bg: "#E6F4EA", text: "#44A185" },
  completed: { bg: "#E6F4EA", text: "#44A185" },
  approved: { bg: "#E6F4EA", text: "#44A185" },
  processed: { bg: "#E6F4EA", text: "#44A185" },
  failed: { bg: "#FCE8E6", text: "#E5333E" },
  declined: { bg: "#FCE8E6", text: "#E5333E" },
  reversed: { bg: "#8C98A41F", text: "#8C98A4" },
  abandoned: { bg: "#FDF1E8", text: "#E77731" },
  pending: { bg: "#FDF1E8", text: "#E77731" },
  processing: { bg: "#FDF1E8", text: "#E77731" },
  initiated: { bg: "#FDF1E8", text: "#E77731" },
};
export const DEFAULT_STATUS_STYLE = { bg: "#F5F5F5", text: "#5A5A5A" };
