import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const initializeBvn = async () => {
  const response = await axios.get(`${baseUrl}/verifications/bvn/initialize`);
  return response.data;
};

export const validateBvn = async (payload: { bvn: string; vendor: string }) => {
  const response = await axios.post(`${baseUrl}/verifications/bvn/validate`, payload);
  return response.data;
};

export const generateBvnOtp = async (payload: any) => {
  const response = await axios.post(`${baseUrl}/verifications/bvn/generate-otp`, payload);
  return response.data;
};

export const verifyBvnOtp = async (payload: any) => {
  const response = await axios.post(`${baseUrl}/verifications/bvn/complete`, payload);
  return response.data;
};

export const getBanksList = async () => {
  const response = await axios.get(`${baseUrl}/verifications/banks/list`);
  return response.data;
};

export const verifyBankAccount = async (payload: any) => {
  const response = await axios.post(`${baseUrl}/verifications/bank-account`, payload);
  return response.data;
};
