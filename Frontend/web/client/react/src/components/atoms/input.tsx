import React, {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import EyeOpen from "../../assets/icons/eye-p.svg";
import EyeClose from "../../assets/icons/eye-c.svg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftIcon, rightIcon, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggleVisibility = () => setShowPassword((prev) => !prev);

    return (
      <>
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            type={
              props.type === "password"
                ? showPassword
                  ? "text"
                  : "password"
                : "text"
            }
            className={`bg-[#F5F5F5] border placeholder-[#9B9B9B] text-[#5A5A5A] text-base w-full py-[12px] focus:outline-none ${
              leftIcon ? "pl-12" : "pl-3"
            } ${
              rightIcon || props.type === "password" ? "pr-12" : "pr-3"
            } ${error ? "focus:border-[#E5333E] border-[#E5333E]" : "focus:border-[#F5F5F5] border-[#F5F5F5]"} ${className.includes("rounded") ? "" : "rounded-xl"} ${className}`}
          />
          {rightIcon && props.type !== "password" && (
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
          {props.type === "password" && (
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:opacity-80 cursor-pointer text-[24px] text-[#075f6b]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <img src={EyeOpen}  alt="" />
              ) : (
                <img src={EyeClose}  alt="" />
              )}
            </button>
          )}
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </>
    );
  },
);

export default Input;
