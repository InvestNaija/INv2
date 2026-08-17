export interface Beneficiary {
  response: unknown;
  id: string;
  active: boolean;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  bankName: string;
  isDefault: boolean;
  isDirectDebit: boolean;
  deletedAt: string | null;
}

export interface UserProfile {
  sourceOfFunds: string;
  image: string;
  accountType: string;
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  nickName: string | null;
  refCode?: string;
  referrer: string | null;
  bvn: string;
  address: string;
  email: string;
  gender: string;
  dob: string;
  phone: string;
  cscs: string | null;
  chn: string | null;
  cscsRef: string | null;
  cscsVerified: boolean;
  cscsRequestStatus: string;
  tier: number;
  cscsRequestFailureReason: string | null;
  role: string;
  verified: boolean;
  riskRatings: string;
  dcs_status: boolean;
  status: string;
  firstLogin: boolean;
  nuban: string;
  nin: string;
  occupation: string;
  accessAuditId: string | null;
  zanibalId: string;
  website: string | null;
  twitter: string | null;
  facebook: string | null;
  linkedIn: string | null;
  youtube: string | null;
  twoFactorAuth: boolean;
  city: string;
  country: string;
  state: string;
  citizen: string | null;
  CscsRequested: boolean;
  mothersMaidenName: string;
  placeOfBirth: string;
  nextOfKinRelationship: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
  nextOfKinAddress: string;
  lastLoggedIn: string;
  deviceToken: string;
  miles_ucc: string;
  show_balance: boolean;
  failedLoginAttempts: number;
  parentId: string | null;
  isMinor: boolean;
  relationship: string | null;
  consentAgreedAt: string | null;
  consentIpAddress: string | null;
  beneficiaries: Beneficiary[];
  okhi_status: string;
  beneficiary: Beneficiary;
  signature: string;
}

// Full shape of GET /customers/profile (or equivalent) used by userContext.
export interface UserProfileResponse {
  status: string;
  data: UserProfile;
}

// A child sub-account as returned by GET /auth/customers/minors — a subset
// of UserProfile's fields plus the KYC documents/beneficiaries uploaded at
// creation time.
export interface MinorAccount {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  dob: string;
  gender: string;
  relationship: string | null;
  status: string;
  createdAt: string;
  image?: string | null;
  kycDocuments: { name: string; value: string }[];
  beneficiaries: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  }[];
}

export interface GetMinorsResponse {
  code: number;
  status: string;
  message: string;
  data: MinorAccount[];
}

// Response from POST /auth/customers/add-minor.
export interface AddMinorResponse {
  code: number;
  status: string;
  message: string;
  data: {
    minor: {
      id: string;
      firstName: string;
      lastName: string;
      isMinor: boolean;
      parentId: string;
      walletInitialized: boolean;
    };
    documents: { name: string; url: string }[];
    walletInitialized: boolean;
  };
}

// Payload for POST /auth/customers/add-minor — sent as FormData since
// birthCertificate/passportPhoto are file uploads.
export interface AddMinorPayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender: string;
  relationship: string;
  minorBankName: string;
  minorAccountNumber: string;
  bankCode: string;
  consent: boolean;
  birthCertificate: File;
  passportPhoto: File;
}

// Response from POST /auth/customers/switch-profile — same flat shape as
// the login response (LoginRO): token/uuid_token at the top level, `data`
// is the switched-to profile itself, not a nested { token, user } wrapper.
export interface SwitchProfileResponse {
  code: number;
  status: string;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    isMinor: boolean;
    parentId?: string | null;
    [key: string]: unknown;
  };
  token: string;
  uuid_token: string;
}

// State shape backing UserContext (see contexts/userContext.tsx).
export interface UserState {
  currentUser: UserProfile;
  isLoading: boolean;
  isUploadingAvatar: boolean;
}

// Actions handled by userContext's reducer.
export type UserAction =
  | { type: "FETCH_USER_START" }
  | { type: "FETCH_USER_SUCCESS"; payload: UserProfile }
  | { type: "FETCH_USER_FAILURE" }

  // payload is the object-URL preview shown instantly while the upload
  // request is in flight.
  | { type: "UPDATE_AVATAR_START"; payload: string }
  | { type: "UPDATE_AVATAR_SUCCESS"; payload: Partial<UserProfile> }
  // payload is the previous image to roll back to on failure.
  | { type: "UPDATE_AVATAR_FAILURE"; payload: string }

  // payload is the new value, applied optimistically before the request
  // resolves; on failure the same action shape rolls it back to the
  // previous value.
  | { type: "SET_SHOW_BALANCE"; payload: boolean }
  | { type: "SET_TWO_FACTOR_AUTH"; payload: boolean };

// Shape of the value UserContext.Provider exposes to consumers.
export interface UserContextType {
  isLoading?: boolean | false;
  currentUser?: UserProfile | null;
  isUploadingAvatar?: boolean;
  updateAvatar: (file: File) => Promise<void>;
  updateShowBalance: (show: boolean) => Promise<void>;
  updateTwoFactorAuth: (enabled: boolean) => Promise<void>;
  // Re-fetches the profile — used to pull the updated `verified` flag into
  // context right after a flow (like email verification) flips it. Returns
  // the fresh profile so a caller that needs to act on it immediately
  // doesn't have to wait for its own next render.
  refetchUser: () => Promise<UserProfile | undefined>;
  submitUpdateProfile: (payload: any) => Promise<any>;
  submitUpdateNextOfKin: (payload: any) => Promise<any>;
  submitUpdateAdditionalKyc: (payload: any) => Promise<any>;
  submitRiskAssessment: (payload: any) => Promise<any>;
  fetchSourceOfFunds: () => Promise<any>;
  fetchBanksList: () => Promise<any>;
  verifyUserBankAccount: (payload: any) => Promise<any>;
  submitAddBeneficiary: (payload: any) => Promise<any>;
  fetchBeneficiaries: () => Promise<any>;
  initiateBvn: () => Promise<any>;
  validateUserBvn: (payload: any) => Promise<any>;
  requestBvnOtp: (payload: any) => Promise<any>;
  confirmBvnOtp: (payload: any) => Promise<any>;
  fetchMinors: () => Promise<MinorAccount[]>;
  submitAddMinor: (payload: FormData) => Promise<AddMinorResponse>;
}
