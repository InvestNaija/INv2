import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import React from "react";

// Define variants for the button
type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost" | "empty" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    // Base styles (Example using Tailwind CSS classes)
    const baseStyles =
      "inline-flex items-center justify-center border font-semibold text-base transition-colors focus:outline-none disabled:cursor-not-allowed cursor-pointer";

    const variants = {
      primary:
        "w-full bg-[#00585E] text-white hover:bg-[#00585E] disabled:bg-[#26C8D1]",
      secondary:
        "w-full bg-[#002B43] text-white hover:bg-[#002B43] disabled:bg-[#2693E1]",
      danger: "w-full bg-[#CC1A30] text-white hover:bg-[#CC1A30]",
      success:
        "w-full bg-[#1F6D3A] text-white hover:bg-[#1B5E32] disabled:bg-[#7FB894]",
      ghost:
        " w-[164px] bg-[#B3EBED] hover:bg-gray-100 text-[#00727A] text-[14px] font-semibold leading-20px tracking-0.28px",
      empty:
        "w-full bg-white text-[#0f0f0f] text-[14px] font-semibold leading-20px tracking-0.28px",
              accent:
        "w-full bg-[#f4f4f4] text-[#0f0f0f] text-[14px] font-semibold leading-20px tracking-0.28px",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {children}
            {isLoading && (
          <Box sx={{ display: "flex", marginLeft: '10px' }}>
            <CircularProgress
              enableTrackSlot
              color="secondary"
              value={100}
              size="30px"
            />
          </Box>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
