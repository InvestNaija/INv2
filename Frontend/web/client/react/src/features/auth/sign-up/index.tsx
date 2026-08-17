import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import Button from "../../../components/atoms/buttons";
import { schema } from "./signup-validators";
import type { SignupDTO } from "./interface";

// "With country select" component.
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import AuthShell, {
  AuthInput,
  AuthLabel,
} from "../../../components/organisms/auth-shell";
import SearchableCountrySelect from "../../../components/molecules/searchable-country-select";

export default function SignUp() {
  // getting the provider from the auth context
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Handed back by create-password's back button (see its onBack) so this
  // step reopens with whatever was already typed instead of a blank form.
  const previousData = (location.state ?? {}) as {
    firstName?: string;
    email?: string;
    phoneNumber?: string;
    referral?: string;
  };

  // redirect to dashboard if already logged in
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/app");
    }
  }, [state.isAuthenticated, navigate]);

  // initialize the form with react hook form and yup resolver for validation
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: previousData.firstName ?? "",
      email: previousData.email ?? "",
      phoneNumber: previousData.phoneNumber ?? "",
      referral: previousData.referral ?? "",
    },
  });

  // Handle form submission: this step only collects the basic profile
  // fields — the actual /auth/customers/signup call fires from the
  // password step once the customer clicks "Create account" there, so we
  // just carry this data forward via router state.
  const onSubmit = async (data: SignupDTO & { firstName?: string; phoneNumber?: string; referral?: string }) => {
    navigate("/auth/create-password", { state: data });
  };

  return (
    <AuthShell step={1} totalSteps={2} onBack={() => navigate("/auth/login")}>
      <h2 className="bg-gradient-to-r from-white to-[#19AFAE] bg-clip-text text-[28px] font-bold leading-[36px] tracking-[-0.3px] text-transparent">
        Create your account
      </h2>
      <p className="mt-[6px] text-[14px] text-white/60">
        Let's get started with your basic information
      </p>

      <form className="mt-[28px]" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <AuthLabel>First Name</AuthLabel>
          <AuthInput
            type="text"
            {...register("firstName")}
            error={errors.firstName?.message as string}
            placeholder="Enter only your first name"
          />
        </div>

        <div className="mt-[20px]">
          <AuthLabel>Email</AuthLabel>
          <AuthInput
            type="email"
            {...register("email")}
            error={errors.email?.message as string}
            placeholder="Enter your email address"
          />
        </div>

        <div className="mt-[20px]">
          <AuthLabel>Phone Number</AuthLabel>
          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: true,
              validate: (value) => isValidPhoneNumber(`${value}`),
            }}
            render={({ field: { onChange, value } }) => (
              <div className="dark-phone-input">
                <PhoneInputWithCountrySelect
                  value={value}
                  onChange={onChange}
                  defaultCountry="NG"
                  international={true}
                  limitMaxLength={true}
                  countryCallingCodeEditable={false}
                  countrySelectComponent={SearchableCountrySelect}
                  id="phoneNumber"
                  placeholder="Enter your phone number"
                  className={`outline-none w-full rounded-2xl border bg-white/10 px-4 py-[14px] text-[15px] text-white transition-colors focus-within:bg-white/[0.14] ${
                    errors.phoneNumber?.message
                      ? "border-[#FF9B8A]"
                      : "border-white/15 focus-within:border-[#8FE3D9]"
                  }`}
                />
              </div>
            )}
          />
          {errors.phoneNumber?.message && (
            <span className="mt-[6px] block text-[12px] text-[#FF9B8A]">
              {errors.phoneNumber?.message as string}
            </span>
          )}
        </div>

        <div className="mt-[20px]">
          <AuthLabel>
            Referral Code <span className="font-normal text-white/40">(Optional)</span>
          </AuthLabel>
          <AuthInput
            type="text"
            {...register("referral")}
            placeholder="Enter code if any"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={state.isLoading}
          isLoading={state.isLoading}
          className="rounded-[99px] h-[56px] mt-[28px] !bg-[#B8F0E8] hover:!bg-[#A5E9DE] !text-[#04181B] font-bold"
        >
          Continue
        </Button>
      </form>

      <div className="mt-[20px] flex justify-center">
        <span className="text-[13px] text-white/50">Have an account?</span>
        <Link className="ml-1 text-[13px] font-semibold text-[#8FE3D9]" to="/auth/login">
          Login
        </Link>
      </div>

      {/* Dark restyle for react-phone-number-input's own internal markup
          (the number field + flag icon), which can't be reached via the
          className prop it forwards to the underlying <input> alone. The
          country picker itself is now SearchableCountrySelect (a custom
          countrySelectComponent), which brings its own dropdown/search
          styling in Tailwind classes directly. */}
      <style>{`
        .dark-phone-input .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 15px;
          padding: 0;
        }
        .dark-phone-input .PhoneInputInput::placeholder {
          color: rgba(255,255,255,0.4);
        }
        .dark-phone-input .PhoneInputCountry {
          margin-right: 12px;
          padding-right: 12px;
          border-right: 1px solid rgba(255,255,255,0.15);
        }
        .dark-phone-input .PhoneInputCountryIcon {
          width: 28px;
          height: 20px;
          box-shadow: none;
          border-radius: 4px;
          overflow: hidden;
        }
        .dark-phone-input .PhoneInputCountryIconImg {
          border-radius: 4px;
        }
      `}</style>
    </AuthShell>
  );
}
