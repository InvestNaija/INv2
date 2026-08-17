import React from "react";

// Define variants for the button
type SearchVariant = "primary" | "secondary" | "danger" | "ghost" | "empty";

interface SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: SearchVariant;
  placeholder: string;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, variant = "primary", placeholder = "Search", ...props }, ref) => {
    // Base styles (Example using Tailwind CSS classes)
    const baseStyles =
      "inline-flex items-center justify-center border font-semibold text-base transition-colors focus:outline-none disabled:cursor-not-allowed";

    const variants = {
      primary:
        "w-full bg-[#F5F5F5] text-[#0f0f0f] hover:bg-[#F5F5F5] disabled:bg-[#F5F5F5]",
      secondary:
        "w-full bg-[#002B43] text-white hover:bg-[#002B43] disabled:bg-[#2693E1]",
      danger: "w-full bg-red-600 text-white hover:bg-red-700",
      ghost:
        " w-[164px] bg-[#B3EBED] hover:bg-gray-100 text-[#00727A] text-[14px] font-semibold leading-20px tracking-0.28px",
      empty:
        "w-full bg-white text-[#0f0f0f] text-[14px] font-semibold leading-20px tracking-0.28px",
    };

    return (
      <>
        <label
          htmlFor="search"
          className="block mb-2.5 text-sm font-medium text-heading sr-only "
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
            >
              <path
                d="M16.031 14.6168L20.3137 18.8995L18.8995 20.3137L14.6168 16.031C13.0769 17.263 11.124 18 9 18C4.032 18 0 13.968 0 9C0 4.032 4.032 0 9 0C13.968 0 18 4.032 18 9C18 11.124 17.263 13.0769 16.031 14.6168ZM14.0247 13.8748C15.2475 12.6146 16 10.8956 16 9C16 5.1325 12.8675 2 9 2C5.1325 2 2 5.1325 2 9C2 12.8675 5.1325 16 9 16C10.8956 16 12.6146 15.2475 13.8748 14.0247L14.0247 13.8748Z"
                fill="#9B9B9B"
              />
            </svg>
          </div>
          <input
            type="search"
            id="search"
            placeholder={placeholder}
            ref={ref}
            {...props}
            className={`${baseStyles} ${variants[variant]} ${className || ""} block w-full px-3 ps-12  text-sm  focus:ring-[#F5F5F5] focus:border-[#F5F5F5] shadow-xs placeholder:text-[#9B9B9B] placeholder:text-[16px] placeholder:font-medium placeholder:leading-[24px]`}
          />
        </div>
      </>
    );
  },
);

export default Search;
