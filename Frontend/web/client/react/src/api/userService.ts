import axios from "axios";
import type { UserProfileResponse } from "../models/userModel";

const baseUrl = import.meta.env.VITE_BASE_URL;


const getUser = async (): Promise<UserProfileResponse> => {
  const response = await axios.get<UserProfileResponse>(`${baseUrl}/customers/profile/fetch`);
  return response.data;
}

const updateAvatar = async (file: File): Promise<UserProfileResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await axios.patch<UserProfileResponse>(
    `${baseUrl}/customers/update-avatar`,
    formData,
  );
  return response.data;
};

export interface UpdateCustomerPayload {
  show_balance: boolean;
}

// Generic customer-settings update — currently only used for the
// show/hide-balance preference, but the endpoint itself takes any subset
// of customer fields.
const updateCustomer = async (
  payload: UpdateCustomerPayload,
): Promise<UserProfileResponse> => {
  const response = await axios.patch<UserProfileResponse>(
    `${baseUrl}/customers/update`,
    payload,
  );
  return response.data;
};

const updateProfile = async (
  payload: any,
): Promise<any> => {
  const response = await axios.patch(
    `${baseUrl}/customers/update-profile`,
    payload,
  );
  return response.data;
};

const updateAdditionalKyc = async (
  payload: any,
): Promise<any> => {
  const response = await axios.post(
    `${baseUrl}/customers/additionalKyc`,
    payload,
  );
  return response.data;
};

const updateNextOfKin = async (
  payload: any,
): Promise<any> => {
  const response = await axios.post(
    `${baseUrl}/customers/next-of-kin`,
    payload,
  );
  return response.data;
};

const submitRiskAssessment = async (
  payload: any,
): Promise<any> => {
  const response = await axios.post(
    `${baseUrl}/customers/risk-ratings-quiz`,
    payload,
  );
  return response.data;
};

export { getUser, updateAvatar, updateCustomer, updateProfile, updateAdditionalKyc, updateNextOfKin, submitRiskAssessment };
