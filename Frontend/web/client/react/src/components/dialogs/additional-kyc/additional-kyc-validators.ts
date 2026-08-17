import * as yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";

// Step 1 Validation Rules
export const bvnSchema = yup.object().shape({
  bvn: yup
    .string()
    .required("BVN is required")
    .matches(/^\d{11}$/, "Please enter a valid 11-digit BVN"),
});

// Step 2 Validation Rules
export const tinSchema = yup.object({
  tin: yup
    .string()
    .required("TIN is required")
    .matches(/^\d{20}$/, "Please enter a valid TIN"),
});

// Step 3 Validation Rules
export const bankAccountSchema = yup.object({
  bankName: yup.string().required("Bank name is required"),
  bankAccountNumber: yup
    .string()
    .required("Bank account number is required")
    .matches(/^\d{10}$/, "Please enter a valid 10-digit bank account number"),
});

// Step 4 Validation Rules
export const secretQuestionsSchema = yup.object({
  secretQuestion: yup.string().required("Secret question is required"),
  secretAnswer: yup.string().required("Secret answer  is required"),
});

// Personal details step: mother's maiden name, place of birth
export const personalDetailsSchema = yup.object({
  mothersMaidenName: yup.string().required("Mother's maiden name is required"),
  placeOfBirth: yup.string().required("Place of birth is required"),
});

// Others step: occupation, source of income — split out from personal
// details into its own step.
export const othersSchema = yup.object({
  occupation: yup.string().required("Occupation is required"),
  sourceOfIncome: yup.string().required("Source of income is required"),
});

// Step 5 Validation Rules
export const kinSchema = yup.object({
  nextOfKinName: yup.string().required("Next of kin full name is required"),
  nextOfKinPhone: yup
    .string()
    .required("Next of kin phone is required")
    .test("isValid", "Please enter a valid phone number", (value) => {
      return value ? isValidPhoneNumber(value) : false;
    }),
  nextOfKinRelationship: yup
    .string()
    .required("Next of kin relationship is required"),
  nextOfKinAddress: yup.string().required("Next of kin address is required"),
});
