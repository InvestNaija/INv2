import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import {
  LocalizationProvider,
  DatePicker
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FormHelperText, Box } from "@mui/material";

// Define explicit component props using Hook Form generics
interface FormDatePickerProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  rules?: Omit<
    RegisterOptions<TFieldValues, Path<TFieldValues>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
}

const DatePickerInputLabel = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
}: FormDatePickerProps<TFieldValues>) => {
  return (
    // LocalizationProvider must wrap the date calculation context
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({
          field: { onChange, value},
          fieldState: { error },
        }) => (
          <Box
            sx={{
              width: "100%",
              // Injects custom border styles directly into the DatePicker's input structure
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#DCDCDC" },
                "&:hover fieldset": { borderColor: "#DCDCDC" },
                "&.Mui-focused fieldset": {
                  borderColor: "#DCDCDC",
                  borderWidth: "1px",
                },

                // Custom error border states
                "&.Mui-error fieldset": {
                  borderColor: "#d32f2f",
                  borderWidth: "2px",
                },
                "&.Mui-error:hover fieldset": { borderColor: "#c62828" },
              },
              
              "& .MuiInputLabel-root.Mui-error": { color: "#d32f2f" },
            }}
          >
            <DatePicker
              label={label}
              value={value || null}
              onChange={(newValue) => onChange(newValue)} // Forwards the Dayjs object to Hook Form
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  error: !!error, // Explicitly applies error classes to internal layout
                  sx: {
                    "& .MuiPickersOutlinedInput-notchedOutline": {
                      borderWidth: "1px !important",
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "#DCDCDC" }, // Default border
                      "&:hover fieldset": { borderColor: "#DCDCDC" }, // Hover border
                      "&.Mui-focused fieldset": { borderColor: "#DCDCDC" }, // Focused border
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderWidth: "1px !important",
                    },
                    "& label.Mui-focused": {
                      color: "#9B9B9B",
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "20px",
                      letterSpacing: "0.2px",
                    },
                    "& fieldset": { borderColor: "#DCDCDC" }, // Default border
                    "&:hover fieldset": { borderColor: "#DCDCDC" }, // Hover border
                    "&.Mui-focused fieldset": { borderColor: "#DCDCDC" }, // Focused border
                    "& .MuiInputLabel-root.Mui-error": { color: "#d32f2f" },
                    "& .MuiFormHelperText-root.Mui-error": { color: "#d32f2f" },
                  },
                },
              }}
            />
            {error && (
              <FormHelperText error sx={{ ml: 2, color: "#d32f2f" }}>
                {error.message}
              </FormHelperText>
            )}
          </Box>
        )}
      />
    </LocalizationProvider>
  );
};

export default DatePickerInputLabel;
