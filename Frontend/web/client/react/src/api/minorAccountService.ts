import axios from "axios";
import type {
  AddMinorResponse,
  GetMinorsResponse,
  SwitchProfileResponse,
} from "../models/userModel";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Creates a child sub-account linked to the authenticated parent. Takes
// FormData (multipart) since birthCertificate/passportPhoto are file
// uploads alongside the plain fields.
const addMinor = async (payload: FormData): Promise<AddMinorResponse> => {
  const response = await axios.post<AddMinorResponse>(
    `${baseUrl}/auth/customers/add-minor`,
    payload,
  );
  return response.data;
};

const getMinors = async (): Promise<GetMinorsResponse> => {
  const response = await axios.get<GetMinorsResponse>(
    `${baseUrl}/auth/customers/minors`,
  );
  return response.data;
};

// Exchanges the parent's session for a JWT scoped to the given child —
// the caller is responsible for stashing the parent's own token before
// swapping the active one, since this response carries no way back.
const switchProfile = async (
  targetCustomerId: string,
): Promise<SwitchProfileResponse> => {
  const response = await axios.post<SwitchProfileResponse>(
    `${baseUrl}/auth/customers/switch-profile`,
    { targetCustomerId },
  );
  return response.data;
};

export { addMinor, getMinors, switchProfile };
