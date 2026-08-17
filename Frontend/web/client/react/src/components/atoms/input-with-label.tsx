import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { TextField, type TextFieldProps } from "@mui/material";

// Define props to include standard MUI TextField props and RHF specific ones
interface FormInputProps<T extends FieldValues> extends Omit<
  TextFieldProps,
  "name"
> {
  name: Path<T>;
  control: Control<T>;
}

const InputLabel = <T extends FieldValues>({
  name,
  control,
  label,
  ...props
}: FormInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <TextField
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "1px",
            },
            "& label.Mui-focused": {
              color: "#9B9B9B",
              fontSize: "14px",
              fontWeight: "500",
              lineHeight: "20px",
              letterSpacing: "0.2px",
                  
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              // Default border color
              "& fieldset": {
                borderColor: "#DCDCDC",
              },
              // Hover border color
              "&:hover fieldset": {
                borderColor: "#DCDCDC",
              },
              // Focused border color
              "&.Mui-focused fieldset": {
                borderColor: "#DCDCDC",
                borderWidth: "1px",
              },
              // 1. Default state when error is true
              "&.Mui-error fieldset": {
                borderColor: "#d32f2f",
                borderWidth: "1px",
              },
              // 2. Hover state when error is true
              "&.Mui-error:hover fieldset": {
                borderColor: "#d32f2f",
              },
              // 3. Focused state when error is true
              "&.Mui-error.Mui-focused fieldset": {
                borderColor: "#d32f2f",
              },
            },
              // Optional: Style the error label text
              "& .MuiInputLabel-root.Mui-error": {
                color: "#d32f2f",
              },
          }}
          {...props}
          label={label}
          value={value ?? ""} // Ensure value is never undefined to keep it controlled
          onChange={onChange}
          inputRef={ref}
          error={!!error}
          helperText={error ? error.message : props.helperText}
          fullWidth
        />
      )}
    />
  );
};

export default InputLabel;
