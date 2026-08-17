import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "./forgot-password-validators";
import type { ForgotPasswordDTO } from "./interface";
import Button from "../../../components/atoms/buttons";
import AuthShell, {
  AuthInput,
  AuthLabel,
} from "../../../components/organisms/auth-shell";

const ForgotPassword = () => {
  // getting the provider from the auth context
  const { state, submitForgotPasswordOtp } = useAuth();
  const navigate = useNavigate();

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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordDTO) => {
    setIsLoading(true);
    try {
      const getUrl = window.location;
      const gateway = '/auth/customers/forgot-password/otp';
      const payload = {
        email: data.email,
        redirectUrl: getUrl.protocol + '//' + getUrl.host + '/auth/set-password',
        gateway: gateway,
      };

      const response = await submitForgotPasswordOtp(payload);
      toast.success(response?.message || "OTP sent successfully!");
      navigate("/auth/set-password", { state: { email: data.email } });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || 
        error?.response?.data?.message || 
        "Failed to request password reset OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="bg-gradient-to-r from-white to-[#19AFAE] bg-clip-text text-[28px] font-bold leading-[36px] tracking-[-0.3px] text-transparent">
        Reset Password
      </h2>
      <p className="mt-[6px] text-[14px] text-white/60">
        Enter your email address and we’ll send you an OTP to reset your password.
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

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          isLoading={isLoading}
          className="rounded-[99px] h-[56px] mt-[24px] !bg-[#B8F0E8] hover:!bg-[#A5E9DE] !text-[#04181B] font-bold w-full"
        >
          Reset password
        </Button>
      </form>

      <div className="mt-[20px] flex justify-center items-center">
        <Link className="flex items-center gap-1 text-[13px] font-semibold text-[#8FE3D9] hover:text-[#A5E9DE] transition-colors" to="/auth/login">
          <i className="ri-arrow-left-line"></i> Back to log in
        </Link>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;
