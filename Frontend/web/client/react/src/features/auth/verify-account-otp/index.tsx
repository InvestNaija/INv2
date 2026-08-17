import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import Button from "../../../components/atoms/buttons";
import AuthShell, { AuthInput } from "../../../components/organisms/auth-shell";
import { useAuth } from "../../../contexts/authContext";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? (error.response?.data?.message ?? error.response?.data?.error?.message ?? error.message)
    : fallback;

export default function VerifyAccountOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  // Passed from welcome/index.tsx's navigate(..., { state }) once login
  // succeeds. This page lives under /auth/*, which isn't wrapped by the
  // User provider (only /app/* is, via ProtectedRoute), so there's no
  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";
  const { submitRequestEmailUpdate, submitVerifyEmailUpdate } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // Only the very first code-send on mount should show a full-page loading
  // state — resends after that just disable the "Resend" link instead.
  const hasSentInitialCode = useRef(false);

  const sendCode = async (targetEmail: string) => {
    setIsSending(true);
    try {
      await submitRequestEmailUpdate(targetEmail);
      setSecondsLeft(RESEND_SECONDS);
      toast.success(`Verification code sent to ${targetEmail}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send verification code"));
    } finally {
      setIsSending(false);
    }
  };

  // Sends the first code as soon as we know which email to verify.
  useEffect(() => {
    if (!email || hasSentInitialCode.current) return;
    hasSentInitialCode.current = true;
    sendCode(email);
  }, [email]);

  // Resend countdown.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleSaveEmail = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setEmail(trimmed);
    setOtp("");
    setIsEditing(false);
    await sendCode(trimmed);
  };

  const handleProceed = async () => {
    if (otp.length !== OTP_LENGTH) return;
    setIsVerifying(true);
    try {
      await submitVerifyEmailUpdate(email, otp);
      navigate("/auth/verify-bvn", { state: { email } });
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid or expired code. Please try again."));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthShell step={1} totalSteps={3} onSkip={() => navigate("/app")}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-[16px]">
        <span className="text-[26px] leading-none">💡</span>
        <p className="mt-[10px] text-[16px] font-bold text-white">Verify your email address</p>
        <p className="mt-[2px] text-[13px] text-white/60">
          We will send a verification code to your email below
        </p>
      </div>

      <div className="mt-[24px]">
        <p className="mb-[8px] text-[13px] font-semibold text-white/85">Email address</p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <AuthInput
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
              className="shrink-0 rounded-2xl bg-white/10 px-4 py-[14px] text-[13px] font-semibold text-[#8FE3D9] hover:bg-white/15 disabled:opacity-50 cursor-pointer"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-2xl border border-white/15 bg-white/10 px-4 py-[14px] text-[15px] text-white">
              {email}
            </div>
            <button
              type="button"
              onClick={() => {
                setEditValue(email);
                setIsEditing(true);
              }}
              className="shrink-0 rounded-2xl bg-white/10 px-4 py-[14px] text-[13px] font-semibold text-white/80 hover:bg-white/15 cursor-pointer"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="mt-[24px] text-center">
        <span className="text-[13px] text-white/50">Didn't get the code? </span>
        {secondsLeft > 0 ? (
          <span className="text-[13px] font-semibold text-white/40">
            Try again in {secondsLeft}
          </span>
        ) : (
          <a
            onClick={() => !isSending && sendCode(email)}
            className={`text-[13px] font-semibold text-[#8FE3D9] ${
              isSending ? "opacity-50" : "cursor-pointer hover:underline"
            }`}
          >
            {isSending ? "Sending…" : "Resend code"}
          </a>
        )}
      </div>

      <div className="mt-[24px] flex justify-center">
        <OtpInput
          containerStyle={{ display: "flex", gap: "10px", justifyContent: "center" }}
          inputStyle={{
            width: "48px",
            height: "48px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            fontSize: "20px",
            fontWeight: 700,
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
          }}
          value={otp}
          onChange={setOtp}
          numInputs={OTP_LENGTH}
          shouldAutoFocus
          placeholder="••••••"
          renderInput={(inputProps) => (
            <input
              {...inputProps}
              className="outline-none transition-colors focus:!border-[#8FE3D9]"
            />
          )}
        />
      </div>

      <Button
        type="button"
        variant="primary"
        disabled={otp.length !== OTP_LENGTH || isVerifying}
        isLoading={isVerifying}
        onClick={handleProceed}
        className="rounded-[99px] h-[56px] mt-[32px] !bg-[#B8F0E8] hover:!bg-[#A5E9DE] !text-[#04181B] font-bold"
      >
        Proceed
      </Button>
    </AuthShell>
  );
}
