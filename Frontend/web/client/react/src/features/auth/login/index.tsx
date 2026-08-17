import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import type { LoginDTO } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "./login-validators";
import { useEffect, useState } from "react";
import Button from "../../../components/atoms/buttons";
import OtpVerification from "../../../components/dialogs/otp-verification";
import { toast } from "react-toastify";
import AuthShell, {
  AuthInput,
  AuthLabel,
} from "../../../components/organisms/auth-shell";

import { encryptPassword } from "../../../hooks/encryption";

export default function Login() {
  // getting the provider from the auth context
  const { state, submitLogin } = useAuth();
  const navigate = useNavigate();

  // Two-factor accounts get a 423 back from the first /login call (right
  // credentials, code still required) — the same credentials are held here
  // so the OTP modal can resubmit them with a `token` field added once the
  // customer enters the code emailed to them.
  const [openTwoFactorOtp, setOpenTwoFactorOtp] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<LoginDTO | null>(null);
  // Tracked separately from state.isLoading so the dialog's submit spinner
  // doesn't also light up while a resend is in flight (both go through the
  // same submitLogin call, since resending is just re-triggering the 423).
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // redirect to dashboard if already logged in — the OTP modal (if open)
  // unmounts along with the rest of this page, so no need to close it here.
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/app");
    }
  }, [state.isAuthenticated, navigate]);

  // initialize the form with react hook form and yup resolver for validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Resolve the device's current coordinates, falling back to an empty
  // string if geolocation is unsupported, denied, or times out.
  const getLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve(`${position.coords.latitude},${position.coords.longitude}`),
        () => resolve(""),
        { timeout: 5000 },
      );
    });
  };

  // Handle form submission: password is RSA-encrypted client-side before it
  // leaves the browser, and device/location metadata is attached so the
  // backend can flag logins from a new device (see device-alert email).
  const onSubmit = async (data: LoginDTO) => {
    const location = await getLocation();
    const encryptedPassword = data.password
      ? await encryptPassword(data.password, import.meta.env.VITE_PUBLIC_KEY)
      : data.password;
    const credentials: LoginDTO = {
      ...data,
      password: encryptedPassword,
      os: navigator.platform,
      deviceName: navigator.userAgent,
      location,
      rememberMe: null,
    };

    const requires2FA = await submitLogin(credentials);
    if (requires2FA) {
      setPendingCredentials(credentials);
      setOpenTwoFactorOtp(true);
    }
  };

  // Resubmits the same /login call with the emailed code added — correct
  // credentials plus a valid token completes the login and the
  // isAuthenticated effect above takes over the redirect.
  const handleTwoFactorSubmit = async (token: string) => {
    if (!pendingCredentials) return;
    await submitLogin({ ...pendingCredentials, token });
  };

  // Re-runs the same credentials-only /login call that produced the first
  // 423 — that's what emails the code in the first place, so doing it again
  // sends a fresh one.
  const handleResendTwoFactorOtp = async () => {
    if (!pendingCredentials) return;
    setIsResendingOtp(true);
    try {
      await submitLogin(pendingCredentials);
      toast.success("A new code has been sent to your email");
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <>
      <AuthShell>
        <h2 className="bg-gradient-to-r from-white to-[#19AFAE] bg-clip-text text-[28px] font-bold leading-[36px] tracking-[-0.3px] text-transparent">
          Welcome back
        </h2>
        <p className="mt-[6px] text-[14px] text-white/60">
          Let's continue your investment journey
        </p>

        <form className="mt-[28px]" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <AuthLabel>Email</AuthLabel>
            <AuthInput
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="Enter your email"
            />
          </div>

          <div className="mt-[20px]">
            <AuthLabel>Password</AuthLabel>
            <AuthInput
              type="password"
              error={errors.password?.message}
              {...register("password")}
              placeholder="Enter your password"
            />
          </div>

          <div className="mt-[12px] flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-[13px] font-medium text-white/60 hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={state.isLoading}
            isLoading={state.isLoading}
            className="rounded-[99px] h-[56px] mt-[24px] !bg-[#B8F0E8] hover:!bg-[#A5E9DE] !text-[#04181B] font-bold"
          >
            Log in
          </Button>
        </form>

        <div className="mt-[20px] flex justify-center">
          <span className="text-[13px] text-white/50">Don't have an account?</span>
          <Link className="ml-1 text-[13px] font-semibold text-[#8FE3D9]" to="/auth/sign-up">
            Sign up
          </Link>
        </div>
      </AuthShell>

      <OtpVerification
        openDialog={openTwoFactorOtp}
        setDialog={setOpenTwoFactorOtp}
        title="Two-Factor Authentication"
        description="Enter the 6-digit code from your email"
        email={pendingCredentials?.email ?? ""}
        isSubmitting={state.isLoading && !isResendingOtp}
        isResending={isResendingOtp}
        onSubmit={handleTwoFactorSubmit}
        onResend={handleResendTwoFactorOtp}
      />
    </>
  );
}
