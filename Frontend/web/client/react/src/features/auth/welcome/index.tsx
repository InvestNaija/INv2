import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/buttons";
import AuthShell from "../../../components/organisms/auth-shell";
import { useAuth } from "../../../contexts/authContext";
import { encryptPassword } from "../../../hooks/encryption";

interface WelcomeState {
  firstName?: string;
  email?: string;
  // In-memory only (router state, never persisted) — carried forward from
  // create-password/index.tsx so "I will do this later" can log the
  // customer straight in with the credentials they just created.
  password?: string;
}

// Resolves the device's current coordinates, falling back to an empty
// string if geolocation is unsupported, denied, or times out — same
// metadata login/index.tsx attaches to every /login call.
const getLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(`${position.coords.latitude},${position.coords.longitude}`),
      () => resolve(""),
      { timeout: 5000 },
    );
  });
};

interface OnboardingTaskProps {
  icon: string;
  title: string;
  description: string;
  duration: string;
}

const OnboardingTask = ({ icon, title, description, duration }: OnboardingTaskProps) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-[16px] py-[14px]">
    <div className="flex items-center gap-3 min-w-0">
      <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-white/10">
        <i className={`${icon} text-[18px] text-white`}></i>
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-white truncate">{title}</p>
        <p className="text-[12px] text-white/50 truncate">{description}</p>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-1 text-[#E8B84B]">
      <i className="ri-time-line text-[13px]"></i>
      <span className="text-[12px] font-semibold whitespace-nowrap">{duration}</span>
    </div>
  </div>
);

export default function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: authState, submitLogin } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // Where to send the customer once login succeeds — /app for "I will do
  // this later", the onboarding wizard for "Let's do this". Set right
  // before calling submitLogin so the effect below knows where to go once
  // isAuthenticated flips.
  const [pendingDestination, setPendingDestination] = useState("/app");
  // Passed from create-password/index.tsx's navigate(..., { state }).
  const { firstName, email, password } = (location.state ?? {}) as WelcomeState;

  // submitLogin only ever returns true for the 2FA (423) case — both a
  // successful login and an outright failure return false, so success has
  // to be read off auth state once the reducer's dispatch lands, same as
  // every other auth page's redirect-when-authenticated effect.
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate(pendingDestination, { state: { email } });
    }
  }, [authState.isAuthenticated, navigate, pendingDestination, email]);

  // Shared by both "Let's do this" and "I will do this later" — the
  // customer already gave us their email and password on the previous
  // steps, so log them straight in rather than dropping them back at the
  // login form to type it all again. Falls back to /auth/login if for some
  // reason the credentials aren't available (e.g. this page was reached
  // directly, without the signup state).
  const loginThenGoTo = async (destination: string) => {
    if (!email || !password) {
      navigate("/auth/login");
      return;
    }

    setPendingDestination(destination);
    setIsLoggingIn(true);
    try {
      const deviceLocation = await getLocation();
      const encryptedPassword = await encryptPassword(password, import.meta.env.VITE_PUBLIC_KEY);
      const requires2FA = await submitLogin({
        email,
        password: encryptedPassword,
        os: navigator.platform,
        deviceName: navigator.userAgent,
        location: deviceLocation,
        rememberMe: null,
      });
      if (requires2FA) {
        // 2FA is on the account already (unlikely right after signup, but
        // possible) — send them to log in normally so the OTP modal there
        // can handle it, rather than building a second copy of that flow.
        navigate("/auth/login");
        return;
      }
      // On success the effect above navigates once isAuthenticated flips;
      // on failure submitLogin has already toasted the error and there's
      // nothing further to do here.
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStart = () => loginThenGoTo("/auth/verify-account");
  const handleSkip = () => loginThenGoTo("/app");

  return (
    <AuthShell onBack={() => navigate("/auth/login")}>
      <div className="text-center">
        <span className="text-[44px] leading-none">🎉</span>
        <h2 className="mt-[16px] bg-gradient-to-r from-white to-[#19AFAE] bg-clip-text text-[22px] font-bold leading-[30px] text-transparent">
          Congratulations{firstName ? ` ${firstName}` : ""}
        </h2>
        <p className="text-[16px] font-semibold text-white/80">
          you're officially an InvestNaija investor 🇳🇬
        </p>
      </div>

      <div className="mt-[28px] flex flex-col gap-[10px]">
        <OnboardingTask
          icon="ri-mail-line"
          title="Confirm Your Email"
          description="Ensure you can get updates about your account"
          duration="30 Sec"
        />
        <OnboardingTask
          icon="ri-bank-card-line"
          title="BVN Verification"
          description="Confirm your identity security"
          duration="1 Min"
        />
        <OnboardingTask
          icon="ri-bank-line"
          title="Bank Account Update"
          description="Link your bank account to start investing"
          duration="1 Min"
        />
      </div>

      <Button
        type="button"
        variant="primary"
        disabled={isLoggingIn}
        isLoading={isLoggingIn}
        onClick={handleStart}
        className="rounded-[99px] h-[56px] mt-[28px] !bg-white/10 hover:!bg-white/20 !text-white !border !border-white/20 font-bold"
      >
        Let's do this
      </Button>

      <div className="mt-[16px] flex justify-center">
        <button
          type="button"
          disabled={isLoggingIn}
          onClick={handleSkip}
          className="text-[14px] font-semibold text-[#E77731] hover:text-[#F0935C] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          I will do this later
        </button>
      </div>
    </AuthShell>
  );
}
