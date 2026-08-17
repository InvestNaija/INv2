import axios from "axios";

// Detects the backend's "you haven't finished onboarding" error shape —
// `{ error: { message: "Verify your bvn to proceed" } }` — distinct from a
// plain failure, since it's actionable (finish Additional KYC) rather than
// a transient error. Shared by every feature (Trade, Investments, Save)
// that can hit this same gate.
//
// Accepts either a thrown/rejected axios error (the portfolios endpoints
// respond with a real non-2xx status) or an already-resolved response body
// (some endpoints — e.g. the save-plan list calls — respond 200 with
// `{ success: false, error: { message } }` instead of throwing), since the
// same message shape shows up either way depending on the endpoint.
const getVerificationMessage = (source: unknown): string | null => {
  let message: string | undefined;

  if (axios.isAxiosError(source)) {
    message = source.response?.data?.error?.message as string | undefined;
  } else if (source && typeof source === "object") {
    const body = source as { success?: boolean; error?: { message?: string } };
    if (body.success === false) {
      message = body.error?.message;
    }
  }

  return message && /^verify your/i.test(message) ? message : null;
};

export default getVerificationMessage;
