import * as yup from "yup";

export const fundSchema = yup.object().shape({
  unit: yup
    .number()
    .typeError("Unit must be a number") // Custom error if input is not a number
    .positive("Unit must be greater than zero")
    .min(1, "Minimum unit is 1")
    .max(10000, "Maximum Unit is 10,000")
    .required("Unit is required"),
});

export const sellSchema = yup.object().shape({
  unit: yup
    .number()
    .typeError("Unit must be a number") // Custom error if input is not a number
    .positive("Unit must be greater than zero")
    .min(1, "Minimum unit is 1")
    .max(10000, "Maximum Unit is 10,000")
    .required("Unit is required"),
  redemptionType: yup.string().required("Redemption type is required"),
});


export const orderSchema = yup.object().shape({
  unit: yup
    .number()
    .typeError("Unit must be a number") // Custom error if input is not a number
    .positive("Unit must be greater than zero")
    .min(1, "Minimum unit is 1")
    .max(10000, "Maximum Unit is 10,000")
    .required("Unit is required"),
  frequency: yup.string().required("Frequency is required"),
});