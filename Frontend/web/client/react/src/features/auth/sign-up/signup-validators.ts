import * as yup from "yup";

export const schema = yup.object().shape({
  firstName: yup
    .string()
    .required("Please enter your first name"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/\S+@\S+\.\S+/, "Please verify your email address and try again"),
  phoneNumber: yup
    .string()
    .required("Phone number is required"),
    referral: yup
    .string(),

});
