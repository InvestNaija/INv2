import { type Control, Controller, type FieldValues, type  Path, type RegisterOptions } from 'react-hook-form';
import { FormControl, Select, MenuItem, type SelectProps } from '@mui/material';

// 1. Structure definition for the selection choices
export interface SelectOption {
  value: string | number;
  label: string;
  // Optional secondary line shown under `label` in the dropdown list, styled
  // distinctly (smaller, muted) from it — e.g. a short explanation of what
  // picking this option means. Omit for a plain single-line option.
  description?: string;
}

// 2. Props interface extending base MUI Select components
interface FormSelectProps<TFieldValues extends FieldValues> extends Omit<SelectProps, 'name'> {
  name: Path<TFieldValues>;                    // Ensures name matches a key in your form schema
  control: Control<TFieldValues>;              // Strictly typed control from hook form
  label: string;
  rules?: Omit<RegisterOptions<TFieldValues, Path<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  options: SelectOption[];
}

export default function FormSelect<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options = [],
  fullWidth = true,
  ...rest
}: FormSelectProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl 
          fullWidth={fullWidth}
          error={!!error} 
          sx={{
               "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "0px",
              border: "none",
            //   background: "#F5F5F5"
            },
            "& label.Mui-focused": {
              color: "#9B9B9B",
              fontSize: "14px",
              fontWeight: "500",
              lineHeight: "20px",
              letterSpacing: "0.2px",
            },
            '& .MuiOutlinedInput-root': {
                borderRadius: "12px",
                background: "#F5F5F5",
              '& fieldset': { borderColor: '#DCDCDC' },
              '&:hover fieldset': { borderColor: '#DCDCDC' },
              '&.Mui-focused fieldset': { borderColor: '#DCDCDC', borderWidth: '1px' },
              '&.Mui-error fieldset': { borderColor: '#d32f2f', borderWidth: '1px', border: '1px solid #d32f2f' },
              '&.Mui-error:hover fieldset': { borderColor: '#c62828' },
                 // 3. Focused state when error is true
              "&.Mui-error.Mui-focused fieldset": {
                borderColor: "#d32f2f",
              },
            },
            '& .MuiInputLabel-root.Mui-error': { color: '#d32f2f' },
            '& .MuiFormHelperText-root.Mui-error': { color: '#d32f2f' }
          }}
        >
          <Select
            {...field}
            {...rest}
            labelId={`${name}-label`}
            id={`${name}-select`}
            label={label}
            renderValue={(selected) =>
              options.find(
                (option) => String(option.value) === String(selected),
              )?.label ?? String(selected)
            }
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    mt: "8px",
                    borderRadius: "20px",
                    border: "1px solid #F0F0F0",
                    boxShadow: "0px 16px 40px rgba(15,15,15,0.12)",
                    maxHeight: "360px",
                  },
                },
                list: {
                  sx: { padding: 0 },
                },
              },
            }}
          >
            {options.map((option) => {
              const isSelected = String(field.value) === String(option.value);
              return (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{
                    whiteSpace: "normal",
                    borderRadius: "14px",
                    margin: "1px 0",
                    padding: "8px 14px",
                    minHeight: 0,
                    transition: "background-color 150ms ease",
                    "&:hover": { backgroundColor: "#F5F5F5" },
                    "&.Mui-selected": {
                      backgroundColor: "#F0FAFB",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#E5F5F6",
                    },
                  }}
                >
                  <div className="flex w-full items-center justify-between gap-[12px]">
                    <div className="flex flex-col py-[2px]">
                      <span
                        className={`text-[14px] font-semibold leading-[20px] ${isSelected ? "text-[#00585E]" : "text-[#0F0F0F]"}`}
                      >
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mt-[2px] text-[12px] font-normal leading-[16px] text-[#9B9B9B]">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <svg
                        className="shrink-0"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="#00585E"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </MenuItem>
              );
            })}
          </Select>
          
          {error && <span className="text-sm text-red-500">{error.message}</span>}
        </FormControl>
      )}
    />
  );
}
