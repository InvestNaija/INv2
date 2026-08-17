import axios from "axios";
import type { LoginDTO, LoginRO } from "../features/auth/login/interface";

const baseUrl = import.meta.env.VITE_BASE_URL;

const login = async (loginData: LoginDTO): Promise<LoginRO> => {
  const response = await axios.post<LoginRO>(`${baseUrl}/auth/customers/login`, loginData);
  return response.data;
};

const logout = async (): Promise<void> => {
  await axios.post(`${baseUrl}/auth/customers/logout`);
};

const refreshSession = async (): Promise<void> => {
  await axios.post(`${baseUrl}/auth/refresh`);
};

const set2FA = async (enable2fa: boolean): Promise<void> => {
  await axios.post(`${baseUrl}/auth/customer/set-2FA`, { enable2fa });
};

export interface ForgotPasswordPayload {
  email: string;
  redirectUrl: string;
  gateway: string;
}

const requestForgotPasswordOtp = async (payload: ForgotPasswordPayload): Promise<any> => {
  const response = await axios.post(`${baseUrl}/auth/customers/forgot-password/otp`, payload);
  return response.data;
};

export interface ResetPasswordPayload {
  email: string;
  // The OTP requestForgotPasswordOtp emailed — sent both as the last path
  // segment and in the body to confirm the reset.
  token: string;
  // RSA-encrypted client-side before this call, the same way login's
  // password field is (see hooks/encryption.ts).
  password: string;
  confirmPassword: string;
}

const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await axios.post(`${baseUrl}/auth/customers/reset-password/${payload.token}`, payload);
};

export interface ChangePasswordPayload {
  // All three values are RSA-encrypted client-side before this call, the
  // same way login's password field is (see hooks/encryption.ts).
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await axios.post(`${baseUrl}/auth/customers/change-password`, payload);
};

export interface SignupPayload {
  firstName: string;
  email: string;
  phone: string;
  referrer?: string;
  terms: boolean;
  // RSA-encrypted client-side before this call, the same way login's
  // password field is (see hooks/encryption.ts).
  password: string;
  confirmPassword: string;
}

const signup = async (payload: SignupPayload): Promise<void> => {
  await axios.post(`${baseUrl}/auth/customers/signup`, payload);
};

// Sends (or resends) a verification code to the given email — also how an
// edited email gets its own code sent, since it's the same call either way.
const requestEmailUpdate = async (email: string): Promise<void> => {
  await axios.post(`${baseUrl}/auth/customers/request-email-update`, { email });
};

// Confirms the code sent by requestEmailUpdate, finalizing that email on
// the account.
const verifyEmailUpdate = async (email: string, otp: string): Promise<void> => {
  await axios.post(`${baseUrl}/auth/customers/verify-email-update`, { email, otp });
};

export {
  login,
  logout,
  refreshSession,
  set2FA,
  changePassword,
  requestForgotPasswordOtp,
  resetPassword,
  signup,
  requestEmailUpdate,
  verifyEmailUpdate,
};
