import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

interface DatePickerInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  minDate?: Dayjs;
}

export const DatePickerInput = <T extends FieldValues>({
  name,
  control,
  label,
  minDate,
}: DatePickerInputProps<T>) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <DatePicker
            label={label}
            value={dayjs(value)}
            onChange={(newValue) => onChange(newValue)}
            minDate={minDate}
            slotProps={{
              textField: {
                error: !!error,
                helperText: error?.message,
                fullWidth: true,
                sx: {
                  width: "100%",
                  background: "#F5F5F5",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": { borderColor: "#e0e0e0" },
                    "&:hover fieldset": { borderColor: "#1976d2" },
                  },
                },
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};
