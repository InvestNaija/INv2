import { useEffect, useState } from "react";
import { Dialog, type DialogProps } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import Button from "../atoms/buttons";
import Input from "../atoms/input";
import { useAuth } from "../../contexts/authContext";
import { useWalletFeatures } from "../../contexts/walletContext";
import { useUser } from "../../contexts/userContext";
import AdditionalKyc from "./additional-kyc";
import isAdditionalKycComplete from "../../hooks/isAdditionalKycComplete";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
// Same "send me a one-time code" endpoint used everywhere else in the app
// (wallet withdrawal, redemption, etc.) — POST /auth/customers/resend-otp
// — rather than the email-change-specific request-email-update.
const VERIFY_OTP_SUBJECT = "Verify Your Account";
const VERIFY_OTP_MESSAGE = "<p>Please find your account verification code</p>";

// This component is mounted independently in many places (ProtectedRoute's
// dashboard shell, plus every trade/invest/save action that gates on
// verification), each with its own local state — a plain module-level
// flag (not component state) is what lets the auto-send behave like a
// single, app-wide "once per session" action across all of them, instead
// of once per individual dialog instance/open.
let hasAutoSentThisSession = false;

interface AccountVerificationProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? (error.response?.data?.message ?? error.response?.data?.error?.message ?? error.message)
    : fallback;

// In-app equivalent of the post-signup email-verification step
// (features/auth/verify-account-otp) — same content/layout, but on a white
// dialog instead of the dark auth-flow background, since this pops up
// mid-session whenever an action is gated behind currentUser.verified
// being false.
const AccountVerification = ({ openDialog, setDialog }: AccountVerificationProps) => {
  const { currentUser, refetchUser } = useUser();
  const { sendWithdrawOtp } = useWalletFeatures();
  const { submitRequestEmailUpdate, submitVerifyEmailUpdate } = useAuth();

  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentUser?.email ?? "");
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setDialog(false);
    }
  };

  const sendCode = async (targetEmail: string) => {
    setIsSending(true);
    try {
      await sendWithdrawOtp({
        email: targetEmail,
        subject: VERIFY_OTP_SUBJECT,
        message: VERIFY_OTP_MESSAGE,
      });
      setSecondsLeft(RESEND_SECONDS);
      toast.success(`Verification code sent to ${targetEmail}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send verification code"));
    } finally {
      setIsSending(false);
    }
  };

  // Sends a code the very first time this pops up anywhere this session —
  // not on every open, since the same gate can trigger from many different
  // pages/dialogs as the customer navigates around while unverified.
  useEffect(() => {
    if (!openDialog) return;
    const startingEmail = currentUser?.email ?? "";
    setEmail(startingEmail);
    setEditValue(startingEmail);
    setIsEditing(false);
    setOtp("");
    if (startingEmail && !hasAutoSentThisSession) {
      hasAutoSentThisSession = true;
      sendCode(startingEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDialog]);

  // Resend countdown.
  useEffect(() => {
    if (!openDialog || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [openDialog, secondsLeft]);

  // Editing to a different email is an actual email change, not just "send
  // me the code again" — that goes through request-email-update (the same
  // one the post-signup email step uses) rather than the generic OTP
  // endpoint, so the backend associates the code with the new address.
  const handleSaveEmail = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSending(true);
    try {
      await submitRequestEmailUpdate(trimmed);
      setEmail(trimmed);
      setOtp("");
      setIsEditing(false);
      setSecondsLeft(RESEND_SECONDS);
      toast.success(`Verification code sent to ${trimmed}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update email"));
    } finally {
      setIsSending(false);
    }
  };

  const handleProceed = async () => {
    if (otp.length !== OTP_LENGTH) return;
    setIsVerifying(true);
    try {
      await submitVerifyEmailUpdate(email, otp);
      toast.success("Email verified");
      const freshUser = await refetchUser();
      setDialog(false);
      // Email is done, but BVN/personal details/bank/next-of-kin might
      // still be outstanding — chain straight into that wizard instead of
      // just closing and leaving the customer to find it themselves.
      if (!isAdditionalKycComplete(freshUser)) {
        setOpenAdditionalKyc(true);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid or expired code. Please try again."));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(0px)", opacity: "0.5" },
        },
        paper: {
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
            width: "440px",
            maxWidth: "calc(100% - 32px)",
          },
        },
      }}
    >
      <div className="flex justify-end">
        <span
          className="text-[#0F0F0F] cursor-pointer bg-[#F5F5F5] border border-[#F4F4F4] rounded-[999px] px-[9px] py-[6px]"
          onClick={() => setDialog(false)}
        >
          <i className="ri-close-fill text-[24px] leading-[28px]"></i>
        </span>
      </div>

      <div className="mt-[16px] rounded-2xl border border-[#F4F4F4] bg-[#F9F9F9] p-[16px]">
        <span className="text-[26px] leading-none">💡</span>
        <p className="mt-[10px] text-[16px] font-bold text-[#0F0F0F]">Verify your email address</p>
        <p className="mt-[2px] text-[13px] text-[#5A5A5A]">
          We will send a verification code to your email below
        </p>
      </div>

      <div className="mt-[24px]">
        <p className="mb-[8px] text-[13px] font-semibold text-[#0F0F0F]">Email address</p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <Input
                type="email"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleSaveEmail}
              disabled={isSending}
              className="shrink-0 rounded-[12px] bg-[#F5F5F5] border border-[#F4F4F4] px-4 py-[12px] text-[13px] font-semibold text-[#0E47D8] disabled:opacity-50 cursor-pointer"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-[12px] border border-[#F4F4F4] bg-[#F9F9F9] px-4 py-[12px] text-[14px] text-[#0F0F0F]">
              {email}
            </div>
            <button
              type="button"
              onClick={() => {
                setEditValue(email);
                setIsEditing(true);
              }}
              className="shrink-0 rounded-[12px] bg-[#F5F5F5] border border-[#F4F4F4] px-4 py-[12px] text-[13px] font-semibold text-[#5A5A5A] cursor-pointer"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="mt-[20px] text-center">
        <span className="text-[#5A5A5A] text-[13px] font-medium">Didn't get the code? </span>
        {secondsLeft > 0 ? (
          <span className="text-[#BFBFBF] text-[13px] font-semibold">
            Try again in {secondsLeft}s
          </span>
        ) : (
          <a
            onClick={() => !isSending && sendCode(email)}
            className={`text-[#0E47D8] text-[13px] font-semibold ${
              isSending ? "opacity-50" : "cursor-pointer hover:underline"
            }`}
          >
            {isSending ? "Resending…" : "Resend code"}
          </a>
        )}
      </div>

      <div className="mt-[24px] flex justify-center">
        <OtpInput
          containerStyle={{ display: "flex", gap: "10px", justifyContent: "center" }}
          inputStyle={{
            width: "44px",
            height: "52px",
            border: "2px solid #DCDCDC",
            borderRadius: "14px",
            fontSize: "20px",
            fontWeight: 800,
            background: "#F9F9F9",
            color: "#0F0F0F",
          }}
          value={otp}
          onChange={setOtp}
          numInputs={OTP_LENGTH}
          shouldAutoFocus
          placeholder="••••••"
          renderInput={(inputProps) => (
            <input
              {...inputProps}
              className="transition-all duration-150 outline-none focus:!border-[#00585E] focus:!bg-white focus:shadow-[0_0_0_4px_rgba(0,88,94,0.15)]"
            />
          )}
        />
      </div>

      <div className="mt-[28px]">
        <Button
          variant="primary"
          disabled={otp.length !== OTP_LENGTH || isVerifying}
          isLoading={isVerifying}
          className="rounded-[99px] h-[56px]"
          onClick={handleProceed}
        >
          Proceed
        </Button>
      </div>
    </Dialog>
    <AdditionalKyc
      openAdditionalKycDialog={openAdditionalKyc}
      setAdditionalKycDialog={setOpenAdditionalKyc}
    />
    </>
  );
};

export default AccountVerification;
