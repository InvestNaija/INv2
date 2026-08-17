import React, { type InputHTMLAttributes, type ReactNode } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <>
        <div className="flex items-start gap-3">
          <input ref={ref} {...props} className="mt-0.5 accent-[#E77731] w-4 h-4 shrink-0" />
       
          <label className="flex-1" htmlFor={props.name}>{label}</label>
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </>
    );
  },
);

export default Checkbox;
