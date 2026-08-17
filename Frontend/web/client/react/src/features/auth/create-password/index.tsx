import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "./create-password-validators";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/atoms/buttons";
import AuthShell, {
  AuthInput,
  AuthLabel,
  AuthCheckbox,
} from "../../../components/organisms/auth-shell";

import { encryptPassword } from "../../../hooks/encryption";

interface SignupState {
  firstName?: string;
  email?: string;
  phoneNumber?: string;
  referral?: string;
}

interface RequirementCheckProps {
  met: boolean;
  label: string;
}

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

export default function CreatePassword() {
  // getting the provider from the auth context
  const { state, submitLogin, submitSignup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Carried forward from the sign-up step (see sign-up/index.tsx's
  // navigate(..., { state: data })) — the actual account isn't created
  // until this step submits, so this is what's sent to
  // /auth/customers/signup alongside the password entered here.
  const signupState = (location.state ?? {}) as SignupState;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // redirect to dashboard if already logged in
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/app");
      
    }
  }, [state.isAuthenticated, navigate]);

  // initialize the form with react hook form and yup resolver for validation
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

  // Handle form submission: this is where the account is actually created
  // — everything collected on the sign-up step is combined with the
  // password entered here and sent to /auth/customers/signup in one call.
  const onSubmit = async (data: { password: string; confirmPassword: string; acceptTerms: boolean }) => {
    setIsSubmitting(true);
    try {
      const [encryptedPassword, encryptedConfirmPassword] = await Promise.all([
        encryptPassword(data.password, import.meta.env.VITE_PUBLIC_KEY),
        encryptPassword(data.confirmPassword, import.meta.env.VITE_PUBLIC_KEY),
      ]);

      await submitSignup({
        firstName: signupState.firstName ?? "",
        email: signupState.email ?? "",
        phone: signupState.phoneNumber ?? "",
        referrer: signupState.referral,
        terms: data.acceptTerms,
        password: encryptedPassword,
        confirmPassword: encryptedConfirmPassword,
      });

      // Log the customer straight in rather than showing a separate
      // "Welcome" screen first — the dashboard itself now prompts email
      // verification (see ProtectedRoute) once they land, so that
      // intermediate page is no longer needed here.
      const deviceLocation = await getLocation();
      const requires2FA = await submitLogin({
        email: signupState.email,
        password: encryptedPassword,
        os: navigator.platform,
        deviceName: navigator.userAgent,
        location: deviceLocation,
        rememberMe: null,
      });
      if (requires2FA) {
        navigate("/auth/login");
      }
      // On success the isAuthenticated effect above navigates to /app; on
      // failure submitLogin has already toasted the error.
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
           error.response?.data?.error?.message ??
           error.message)
        : error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      step={2}
      totalSteps={2}
      onBack={() => navigate("/auth/sign-up", { state: signupState })}
    >
      <h2 className="text-[28px] font-bold leading-[36px] tracking-[-0.3px] text-white">
        Create <span className="text-[#8FE3D9]">password</span>
      </h2>
      <p className="mt-[6px] text-[14px] text-white/60">
        Choose a strong password to protect your investments
      </p>

      <form className="mt-[28px]" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <AuthLabel>Password</AuthLabel>
          <AuthInput
            type="password"
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
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
            placeholder="Enter confirm password"
          />
        </div>

        <div className="mt-[24px]">
          <AuthCheckbox
            label={
              <>
                By signing up, you agree to our{" "}
                <a
                  href="/auth/legal/terms_of_use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E77731] hover:text-[#F0935C]"
                >
                  Terms of Use
                </a>
                ,{" "}
                <a
                  href="/auth/legal/privacy_policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E77731] hover:text-[#F0935C]"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/auth/legal/risk_disclosure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E77731] hover:text-[#F0935C]"
                >
                  Risk Disclosure
                </a>
                .
              </>
            }
            error={errors.acceptTerms?.message as string}
            {...register("acceptTerms")}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="rounded-[99px] h-[56px] mt-[28px] !bg-[#B8F0E8] hover:!bg-[#A5E9DE] !text-[#04181B] font-bold"
        >
          Create Account
        </Button>
      </form>
    </AuthShell>
  );
}
