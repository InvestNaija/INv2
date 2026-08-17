import React, { useState, type InputHTMLAttributes, type ReactNode } from "react";
import AppLogo from "../../assets/icons/investNaija-logo-white.svg";

// Dark-theme label/input pair for these auth screens — the shared atoms in
// components/atoms (Label, Input) hardcode a light background/border that
// isn't easily overridden from the outside, so these are purpose-built for
// the dark glass card instead.
export const AuthLabel = ({ children }: { children: ReactNode }) => (
  <label className="mb-[8px] block text-[13px] font-semibold text-white/85">
    {children}
  </label>
);

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ error, className = "", type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div>
        <div className="relative">
          <input
            ref={ref}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={`auth-input w-full rounded-2xl border bg-white/10 px-4 py-[14px] text-[15px] text-white placeholder-white/40 outline-none transition-colors focus:bg-white/[0.14] ${
              error
                ? "border-[#FF9B8A]"
                : "border-white/15 focus:border-[#8FE3D9]"
            } ${isPassword ? "pr-12" : ""} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/70 hover:text-white cursor-pointer"
            >
              <i
                className={`${showPassword ? "ri-eye-line" : "ri-eye-close-line"} text-[19px]`}
              ></i>
            </button>
          )}
        </div>
        {error && (
          <span className="mt-[6px] block text-[12px] text-[#FF9B8A]">
            {error}
          </span>
        )}
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";

interface AuthCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export const AuthCheckbox = React.forwardRef<HTMLInputElement, AuthCheckboxProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[5px] border border-white/30 bg-white/5 accent-[#8FE3D9]"
          {...props}
        />
        <label className="flex-1 text-[13px] leading-[19px] text-white/60" htmlFor={props.name}>
          {label}
        </label>
      </div>
      {error && <span className="mt-[6px] block text-[12px] text-[#FF9B8A]">{error}</span>}
    </div>
  ),
);
AuthCheckbox.displayName = "AuthCheckbox";

interface AuthShellProps {
  children: ReactNode;
  // Step-dash indicator in the card header — omit both to hide it entirely
  // (used on the post-signup "welcome" screen, which isn't really a step).
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  // Post-signup onboarding steps (email/BVN/bank) — replaces the logo with
  // a "Skip" link straight to the dashboard, since those steps are
  // optional and there's no logo in that design.
  onSkip?: () => void;
}

// Shared chrome for every auth screen in the (re)designed signup flow —
// same full-bleed background image as the login page (auth-bg.svg already
// contains the whole decorative scene — arrow graphic, floating badges,
// gradient), with a glass-card right panel holding the actual step content.
const AuthShell = ({ children, step, totalSteps, onBack, onSkip }: AuthShellProps) => {
  const showSteps = Boolean(step && totalSteps);

  return (
    <div className="min-h-screen w-full flex bg-[url(/src/assets/imgs/auth-bg.svg)] bg-cover bg-center overflow-hidden">
      {/* Left: empty — the background image already carries the scene */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-8"></div>

      {/* Right: glass card with the actual step content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[500px] rounded-[32px] p-8 sm:p-10 border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Go back"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
                >
                  <i className="ri-arrow-left-line text-[18px]"></i>
                </button>
              )}
              {showSteps && (
                <div className="flex gap-[6px]">
                  {Array.from({ length: totalSteps as number }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-[4px] rounded-full transition-all duration-300 ${
                        i === (step as number) - 1
                          ? "w-7 bg-[#8FE3D9]"
                          : "w-4 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="text-[14px] font-semibold text-[#E77731] hover:text-[#F0935C] cursor-pointer"
              >
                Skip
              </button>
            ) : (
              <img src={AppLogo} alt="InvestNaija" className="h-[44px]" />
            )}
          </div>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-[11px] leading-[16px] text-white/40">
            Chapel Hill Denham Securities is registered and regulated by the
            Securities and Exchange Commission
          </p>
        </div>
      </div>

      {/* Browser autofill (a saved email/password on the login page, most
          often) forces its own opaque white input background and dark text
          via a UA style that plain CSS can't override normally — this is
          the standard -webkit-box-shadow inset trick to reclaim it, so the
          field stays on-theme and the eye icon isn't left invisible against
          a white autofill background. */}
      <style>{`
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          caret-color: #ffffff;
          -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.10) inset;
          box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.10) inset;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default AuthShell;
