import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  getUser,
  updateAvatar as updateAvatarRequest,
  updateCustomer,
  updateProfile,
  updateNextOfKin,
  updateAdditionalKyc,
  submitRiskAssessment
} from "../api/userService";
import { set2FA } from "../api/authService";
import { getSourceOfFunds } from "../api/lovsService";
import { getBanksList, verifyBankAccount, initializeBvn, validateBvn, generateBvnOtp, verifyBvnOtp } from "../api/verificationService";
import { getTransactions, addBeneficiary, getBeneficiaries } from "../api/transactionService";
import { addMinor, getMinors } from "../api/minorAccountService";
import { cachePrimaryBvn } from "../hooks/effectiveBvn";
import { cachePrimaryProfile } from "../hooks/primaryProfileCache";
import type {
  Beneficiary,
  MinorAccount,
  UserAction,
  UserContextType,
  UserProfile,
  UserProfileResponse,
  UserState,
} from "../models/userModel";

export type {
  Beneficiary,
  MinorAccount,
  UserAction,
  UserContextType,
  UserProfile,
  UserProfileResponse,
  UserState,
};

// isLoading starts true (not false) — the profile fetch kicks off from a
// mount effect below, so anything gating on "has the profile loaded yet"
// (e.g. ProtectedRoute's unverified-account prompt) needs isLoading to
// already read true on the very first render, before that effect has had
// a chance to dispatch FETCH_USER_START itself.
const initialState: UserState = {
  currentUser: {} as UserProfile,
  isLoading: true,
  isUploadingAvatar: false,
};

// Mirrors the authReducer pattern in authContext.tsx: START flips a loading
// flag, SUCCESS/FAILURE resolve it and (for avatar updates) sync the image.
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "FETCH_USER_START":
      return { ...state, isLoading: true };
    case "FETCH_USER_SUCCESS":
      return { ...state, isLoading: false, currentUser: action.payload };
    case "FETCH_USER_FAILURE":
      return { ...state, isLoading: false };

    case "UPDATE_AVATAR_START":
      return {
        ...state,
        isUploadingAvatar: true,
        currentUser: { ...state.currentUser, image: action.payload },
      };
    case "UPDATE_AVATAR_SUCCESS":
      return {
        ...state,
        isUploadingAvatar: false,
        currentUser: { ...state.currentUser, ...action.payload },
      };
    case "UPDATE_AVATAR_FAILURE":
      return {
        ...state,
        isUploadingAvatar: false,
        currentUser: { ...state.currentUser, image: action.payload },
      };

    case "SET_SHOW_BALANCE":
      return {
        ...state,
        currentUser: { ...state.currentUser, show_balance: action.payload },
      };
    case "SET_TWO_FACTOR_AUTH":
      return {
        ...state,
        currentUser: { ...state.currentUser, twoFactorAuth: action.payload },
      };
    default:
      return state;
  }
};

const UserContexts = createContext<UserContextType | undefined>(undefined);

export default function User({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { currentUser, isLoading, isUploadingAvatar } = state;

  // Re-fetches the current profile — exposed as `refetchUser` so a flow
  // like email verification (which flips `verified` on the backend) can
  // pull the updated flag into context right away, instead of the app only
  // finding out on the next full reload. Returns the fresh profile too,
  // since a caller that needs to act on it immediately (e.g. deciding
  // whether Additional KYC is still needed) can't rely on `currentUser`
  // from its own closure — that only updates on the next render.
  // Memoized (stable identity across renders) since it's exposed via
  // context as refetchUser — an unmemoized function here gets a new
  // reference on every render of this provider (including ones triggered
  // by unrelated ancestors, e.g. authContext's switch-profile loader
  // state), which would spuriously re-fire any consumer effect that lists
  // it as a dependency.
  const fetchUser = useCallback(async (): Promise<UserProfile | undefined> => {
    dispatch({ type: "FETCH_USER_START" });
    try {
      const response = await getUser();
      dispatch({ type: "FETCH_USER_SUCCESS", payload: response.data });
      cachePrimaryBvn(response.data);
      cachePrimaryProfile(response.data);
      return response.data;
    } catch {
      dispatch({ type: "FETCH_USER_FAILURE" });
      return undefined;
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Uploads a new profile photo and updates currentUser (shared via this
  // context) so the new image shows up everywhere it's used — the settings
  // page and the sidebar/dropdown avatars in ProtectedRoute. Shows an
  // instant local preview while the upload is in flight, and rolls back to
  // the previous image if the request fails.
  const updateAvatar = async (file: File) => {
    const previousImage = currentUser.image;
    const previewUrl = URL.createObjectURL(file);
    dispatch({ type: "UPDATE_AVATAR_START", payload: previewUrl });
    try {
      const response = await updateAvatarRequest(file);
      dispatch({ type: "UPDATE_AVATAR_SUCCESS", payload: response.data });
    } catch (error) {
      dispatch({ type: "UPDATE_AVATAR_FAILURE", payload: previousImage });
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : "Failed to update profile photo";
      toast.error(errorMessage);
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };


  // Toggles the app-wide "hide amounts" preference. Applied optimistically
  // (every balance display reads currentUser.show_balance) and persisted to
  // the backend so it survives a reload/other devices; rolled back if the
  // request fails.
  const updateShowBalance = async (show: boolean) => {
    const previousValue = currentUser.show_balance;
    dispatch({ type: "SET_SHOW_BALANCE", payload: show });
    try {
      await updateCustomer({ show_balance: show });
    } catch (error) {
      dispatch({ type: "SET_SHOW_BALANCE", payload: previousValue });
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : "Failed to update balance visibility";
      toast.error(errorMessage);
    }
  };

  // Toggles two-factor authentication. Same optimistic-update-then-persist
  // pattern as updateShowBalance: flip currentUser.twoFactorAuth right away
  // so the switch responds instantly, roll back and toast if the request
  // fails.
  const updateTwoFactorAuth = async (enabled: boolean) => {
    const previousValue = currentUser.twoFactorAuth;
    dispatch({ type: "SET_TWO_FACTOR_AUTH", payload: enabled });
    try {
      await set2FA(enabled);
      toast.success(
        enabled
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled",
      );
    } catch (error) {
      dispatch({ type: "SET_TWO_FACTOR_AUTH", payload: previousValue });
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : "Failed to update two-factor authentication";
      toast.error(errorMessage);
    }
  };

  const submitUpdateProfile = async (payload: any) => updateProfile(payload);
  const submitUpdateNextOfKin = async (payload: any) => updateNextOfKin(payload);
  const submitUpdateAdditionalKyc = async (payload: any) => updateAdditionalKyc(payload);
  const submitRiskAssessmentData = async (payload: any) => submitRiskAssessment(payload);
  const fetchSourceOfFunds = async () => getSourceOfFunds();
  const fetchBanksList = async () => getBanksList();
  const verifyUserBankAccount = async (payload: any) => verifyBankAccount(payload);
  const submitAddBeneficiary = async (payload: any) => addBeneficiary(payload);
  const fetchBeneficiaries = async () => getBeneficiaries();
  const initiateBvn = async () => initializeBvn();
  const validateUserBvn = async (payload: any) => validateBvn(payload);
  const requestBvnOtp = async (payload: any) => generateBvnOtp(payload);
  const confirmBvnOtp = async (payload: any) => verifyBvnOtp(payload);

  // Memoized for the same reason fetchUser is — switch-account.tsx and
  // settings/accounts/index.tsx both list this in an effect's dependency
  // array, so an unmemoized (new-every-render) function here would
  // re-trigger those effects (calling GET /auth/customers/minors again,
  // including right after a profile switch when it was never asked for)
  // any time this provider re-rendered for an unrelated reason.
  const fetchMinors = useCallback(async (): Promise<MinorAccount[]> => {
    const response = await getMinors();
    return response.data;
  }, []);
  const submitAddMinor = async (payload: FormData) => addMinor(payload);

  return (
    <UserContexts.Provider
      value={{
        isLoading,
        currentUser,
        isUploadingAvatar,
        updateAvatar,
        updateShowBalance,
        updateTwoFactorAuth,
        refetchUser: fetchUser,
        submitUpdateProfile,
        submitUpdateNextOfKin,
        submitUpdateAdditionalKyc,
        submitRiskAssessment: submitRiskAssessmentData,
        fetchSourceOfFunds,
        fetchBanksList,
        verifyUserBankAccount,
        submitAddBeneficiary,
        fetchBeneficiaries,
        initiateBvn,
        validateUserBvn,
        requestBvnOtp,
        confirmBvnOtp,
        fetchMinors,
        submitAddMinor,
      }}
    >
      {children}
    </UserContexts.Provider>
  );
}



// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContexts);

  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }

  return context;
}
