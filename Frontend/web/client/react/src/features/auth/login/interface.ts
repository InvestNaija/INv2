export interface Beneficiary {
  id: string;
  active: boolean;
  accountNumber: string;
  bankName: string;
  accountName: string;
  isDefault: boolean;
  isDirectDebit: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: string;
  phone: string;
  cscs: string | null;
  chn: string | null;
  role: string;
  zanibalId: string;
  twoFactorAuth: boolean;
  verified: boolean;
  isMinor: boolean;
  parentId: string | null;
  nickName: string | null;
  beneficiaries: Beneficiary[];
  lastLoggedIn: string;
  updatedAt: string;
  zanibal: string;
}



export interface LoginDTO {
    email?: string | undefined;
    password?: string | undefined;
    // remember?: boolean | undefined;
    os?: string;
    deviceName?: string;
    location?: string;
    rememberMe?: boolean | null;
    // The 2FA authenticator-app code — only sent on the resubmission after
    // the first /login call responds 423 (2FA required).
    token?: string;
}


export interface LoginRO {
  code: number;
  status: string;
  message: string;
  data: User;
  token: string;
  uuid_token: string;
}
