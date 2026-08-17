import type { User } from "../features/auth/login/interface";

// State shape backing AuthContext (see contexts/authContext.tsx).
export interface AuthState {
  user: User | null;
  token: string | null;
  uuid: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
}

// Actions handled by authContext's reducer.
export type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string; uuid: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  // The account has 2FA enabled (backend responds 423 to the initial
  // credentials-only login) — stops the loading spinner without surfacing
  // an error toast, since this isn't a failure, just a second step.
  | { type: "LOGIN_2FA_REQUIRED" }

  | { type: "SIGNUP_START" }
  // No user/token here — the signup endpoint only creates the account and
  // doesn't return an auth token; the caller (create-password/index.tsx)
  // logs in separately right after this resolves, which is what actually
  // sets isAuthenticated via LOGIN_SUCCESS.
  | { type: "SIGNUP_SUCCESS" }
  | { type: "SIGNUP_FAILURE"; payload: string }

  | { type: "FORGOT_PASSWORD_START" }
  | { type: "FORGOT_PASSWORD_SUCCESS" }
  | { type: "FORGOT_PASSWORD_FAILURE"; payload: string }

  | { type: "LOGOUT" }

  | { type: "SESSION_TIMEOUT" }
  | { type: "DISMISS_SESSION_EXPIRED" }

  | { type: "SWITCH_PROFILE_START" }
  // A pure replace — token/uuid become whichever profile was just switched
  // to (parent or child, either direction), same as LOGIN_SUCCESS. Nothing
  // about the previous profile is kept around: switching to another profile
  // later, including back to the parent, is just another SWITCH_PROFILE_SUCCESS
  // targeting a different id.
  | { type: "SWITCH_PROFILE_SUCCESS"; payload: { token: string; uuid: string } }
  | { type: "SWITCH_PROFILE_FAILURE"; payload: string };

// Shape of the value AuthContext.Provider exposes to consumers.
export interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  // Resolves true when the backend responded 423 (2FA required) so the
  // caller knows to prompt for a code and resubmit with a `token` field.
  submitLogin: (credentials: object) => Promise<boolean>;
  submitSignup: (credentials: object) => Promise<void>;
  submitCreatePassword: (credentials: object) => Promise<void>;
  submitForgotPasswordOtp: (payload: { email: string; redirectUrl: string; gateway: string }) => Promise<any>;
  submitResetPassword: (payload: { email: string; token: string; password: string; confirmPassword: string }) => Promise<void>;
  submitChangePassword: (payload: any) => Promise<any>;
  submitRequestEmailUpdate: (email: string) => Promise<any>;
  submitVerifyEmailUpdate: (email: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  dismissSessionExpired: () => void;
  // Switches the active session to the given profile's token/uuid — a plain
  // replace, works in either direction (parent -> child or child -> parent,
  // by targeting the parent's own id via currentUser.parentId). Reloads the
  // whole app (with its own loading screen) once the swap succeeds, so
  // every piece of UI — and every independent hook/context that fetches
  // its own data once — reads the new profile fresh. Callers don't need to
  // refetch anything themselves.
  submitSwitchProfile: (targetCustomerId: string) => Promise<void>;
}
