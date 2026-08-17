import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "./set-password-validators";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import Button from "../../../components/atoms/buttons";
import AuthShell, {
  AuthInput,
  AuthLabel,
} from "../../../components/organisms/auth-shell";
import { encryptPassword } from "../../../hooks/encryption";
import type { SetPasswordDTO } from "./interface";

const OTP_LENGTH = 6;

interface ForgotPasswordState {
  email?: string;
}

interface RequirementCheckProps {
  met: boolean;
  label: string;
}

// Same checklist pattern as create-password/index.tsx, kept local rather
// than shared since it's a handful of lines and each auth screen owns its
// own copy already.
const RequirementCheck = ({ met, label }: RequirementCheckProps) => (
  <div className="flex items-center gap-[10px]">
    <i
      className={`text-[16px] ${
        met ? "ri-checkbox-circle-fill text-[#8FE3D9]" : "ri-checkbox-blank-circle-line text-white/30"
      }`}
    ></i>
    <span className={`text-[13px] ${met ? "text-white/90" : "text-white/50"}`}>{label}</span>
  </div>
);

// Hides the middle of the local part: "rauyhghhbjbjb@gmail.com" ->
// "ra***********@gmail.com" — same masking otp-verification.tsx uses.
const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - visible.length, 3))}@${domain}`;
};

export default function SetPassword() {
  const { state, submitForgotPasswordOtp, submitResetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Carried forward from forgot-password/index.tsx's navigate(..., { state })
  // once the reset OTP has been emailed — this page collects that code
  // alongside the new password rather than making the customer hop through
  // a separate "enter OTP" screen first.
  const { email } = (location.state ?? {}) as ForgotPasswordState;

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // redirect to dashboard if already logged in
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/app");
    }
  }, [state.isAuthenticated, navigate]);

  // No email in state means this was opened directly (e.g. a stale
  // bookmark) rather than via the forgot-password flow — send back to
  // start it properly instead of showing a broken form.
  useEffect(() => {
    if (!email) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const password = watch("password") || "";

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    try {
      const getUrl = window.location;
      await submitForgotPasswordOtp({
        email,
        redirectUrl: getUrl.protocol + "//" + getUrl.host + "/auth/set-password",
        gateway: "/auth/customers/forgot-password/otp",
      });
      toast.success("A new code has been sent to your email");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: { message?: string }; message?: string } } })
          ?.response?.data?.error?.message ??
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to resend code";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: SetPasswordDTO) => {
    if (!email || otp.length !== OTP_LENGTH) return;
    setIsSubmitting(true);
    try {
      const [encryptedPassword, encryptedConfirmPassword] = await Promise.all([
        encryptPassword(data.password ?? "", import.meta.env.VITE_PUBLIC_KEY),
        encryptPassword(data.confirmPassword ?? "", import.meta.env.VITE_PUBLIC_KEY),
      ]);

      await submitResetPassword({
        email,
        token: otp,
        password: encryptedPassword,
        confirmPassword: encryptedConfirmPassword,
      });

      toast.success("Password reset successfully. Please log in.");
      navigate("/auth/login");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: { message?: string }; message?: string } } })
          ?.response?.data?.error?.message ??
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to reset password";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell onBack={() => navigate("/auth/forgot-password")}>
      <h2 className="text-[28px] font-bold leading-[36px] tracking-[-0.3px] text-white">
        Set <span className="text-[#8FE3D9]">new password</span>
      </h2>
      <p className="mt-[6px] text-[14px] text-white/60">
        Enter the code we sent to{" "}
        {email ? <span className="text-white/90">{maskEmail(email)}</span> : "your email"}, and
        choose a new password.
      </p>

      <form className="mt-[28px]" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <AuthLabel>Verification code</AuthLabel>
          <OtpInput
            containerStyle="flex gap-[8px] sm:gap-[10px] justify-between"
            skipDefaultStyles
            value={otp}
            onChange={setOtp}
            numInputs={OTP_LENGTH}
            shouldAutoFocus
            renderInput={(inputProps) => (
              <input
                {...inputProps}
                autoComplete="one-time-code"
                className="auth-input h-[48px] w-[15%] rounded-2xl border border-white/15 bg-white/10 text-center text-[18px] font-bold text-white outline-none transition-colors focus:border-[#8FE3D9] focus:bg-white/[0.14]"
              />
            )}
          />
          <div className="mt-[10px] flex justify-end">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className={`text-[13px] font-semibold text-[#8FE3D9] transition-colors hover:text-[#A5E9DE] ${
                isResending ? "opacity-50" : "cursor-pointer"
              }`}
            >
              {isResending ? "Resending…" : "Resend code"}
            </button>
          </div>
        </div>

        <div className="mt-[16px]">
          <AuthLabel>New password</AuthLabel>
          <AuthInput
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
            placeholder="Enter password"
          />
        </div>

        <div className="mt-[16px]">
          <p className="mb-[10px] text-[13px] font-semibold text-white/70">
            Password requirements:
          </p>
          <div className="flex flex-col gap-[8px]">
            {requirements.map((req) => (
              <RequirementCheck key={req.label} met={req.met} label={req.label} />
            ))}
          </div>
        </div>

        <div className="mt-[20px]">
          <AuthLabel>Confirm password</AuthLabel>
          <AuthInput
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
            placeholder="Enter confirm password"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || otp.length !== OTP_LENGTH}
          isLoading={isSubmitting}
          className="rounded-[99px] h-[56px] mt-[28px] !bg-[#B8F0E8] hover:!bg-[#A5E9DE] !text-[#04181B] font-bold w-full"
        >
          Reset password
        </Button>
      </form>

      <div className="mt-[20px] flex justify-center items-center">
        <Link
          className="flex items-center gap-1 text-[13px] font-semibold text-[#8FE3D9] hover:text-[#A5E9DE] transition-colors"
          to="/auth/login"
        >
          <i className="ri-arrow-left-line"></i> Back to log in
        </Link>
      </div>
    </AuthShell>
  );
}
