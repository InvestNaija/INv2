import { createContext, useContext, useEffect, useLayoutEffect, useReducer, useState } from "react";
import axios from "axios";
import { login, logout as logoutRequest, refreshSession, requestForgotPasswordOtp, resetPassword, changePassword, requestEmailUpdate, verifyEmailUpdate, signup, type ChangePasswordPayload, type ResetPasswordPayload } from "../api/authService";
import { switchProfile } from "../api/minorAccountService";
import { toast } from "react-toastify";
import type { AuthAction, AuthContextType, AuthState } from "../models/authModel";
import SessionExpired from "../components/dialogs/session-expired";
import SwitchingOverlay from "../components/atoms/switching-overlay";

export type { AuthAction, AuthContextType, AuthState };

// How long a session may sit idle (no mouse/keyboard/scroll activity)
// before it's treated as expired.
const SESSION_TIMEOUT_MS = 10 * 60 * 1000;
// Minimum gap between /auth/refresh calls so continuous activity (e.g.
// mousemove) doesn't hammer the endpoint on every event.
const REFRESH_THROTTLE_MS = 60 * 1000;

// Reads the persisted auth token from localStorage so a refreshed page can
// restore the session without forcing the user to log in again.
const getToken = (): string | null => {
  return localStorage.getItem("landlordStorageKey");
};

// Reads the persisted uuid_token (issued by the login response) from
// localStorage so a refreshed page can keep sending it without re-logging in.
const getUuid = (): string | null => {
  return localStorage.getItem("uuid");
};

const persistedToken = getToken() || null;

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  token: persistedToken,
  uuid: getUuid(),
  isAuthenticated: Boolean(persistedToken),
  sessionExpired: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function Auth({ children }: { children: React.ReactNode }) {
  // Persists the auth token to localStorage so it survives a page refresh;
  // a falsy key (e.g. on logout) is left untouched here intentionally.
  const setToken = (key: string | null | undefined) => {
    if (key) {
      localStorage.setItem("landlordStorageKey", key);
    }
  };

  // Persists the uuid_token returned by the login response, the same way
  // setToken persists the JWT.
  const setUuid = (uuid: string | null | undefined) => {
    if (uuid) {
      localStorage.setItem("uuid", uuid);
    }
  };

  // Central state machine for login/signup: START flips isLoading, SUCCESS
  // stores the user/token and marks the session authenticated, FAILURE
  // records the error message for the UI to display.
  const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
      case "LOGIN_START":
        return { ...state, isLoading: true, error: null };
      case "LOGIN_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isAuthenticated: true,
          user: action.payload.user,
          token: action.payload.token,
          uuid: action.payload.uuid,
        };
      case "LOGIN_FAILURE":
        return { ...state, isLoading: false, error: action.payload };
      case "LOGIN_2FA_REQUIRED":
        return { ...state, isLoading: false, error: null };

      case "SIGNUP_START":
        return { ...state, isLoading: true, error: null };
      case "SIGNUP_SUCCESS":
        // Account created but not yet authenticated — the caller logs in
        // separately right after (see submitSignup's comment), which is
        // what actually sets isAuthenticated.
        return { ...state, isLoading: false, error: null };
      case "SIGNUP_FAILURE":
        return { ...state, isLoading: false, error: action.payload };

      case "FORGOT_PASSWORD_START":
        return { ...state, isLoading: true, error: null };
      case "FORGOT_PASSWORD_SUCCESS":
        return { ...state, isLoading: false, error: null };
      case "FORGOT_PASSWORD_FAILURE":
        return { ...state, isLoading: false, error: action.payload };

      case "LOGOUT":
        return {
          ...state,
          user: null,
          token: null,
          uuid: null,
          isAuthenticated: false,
        };

      case "SESSION_TIMEOUT":
        return {
          ...state,
          user: null,
          token: null,
          uuid: null,
          isAuthenticated: false,
          sessionExpired: true,
        };
      case "DISMISS_SESSION_EXPIRED":
        return { ...state, sessionExpired: false };

      case "SWITCH_PROFILE_START":
        return { ...state, isLoading: true, error: null };
      case "SWITCH_PROFILE_SUCCESS":
        return {
          ...state,
          isLoading: false,
          token: action.payload.token,
          uuid: action.payload.uuid,
        };
      case "SWITCH_PROFILE_FAILURE":
        return { ...state, isLoading: false, error: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Non-null while a profile switch is underway — renders the full-screen
  // loader below and gates a brief pause before the hard reload so the
  // message actually gets to paint first. A full reload (not just
  // refetching currentUser in place) is deliberate: portfolio holdings,
  // wallet balance, transactions, save plans, etc. each live in their own
  // hook/context that only fetches once and doesn't listen for a profile
  // switch, so an in-place refetch of just the user profile left all of
  // that showing the previous account's data. Reloading is what makes
  // every one of those re-fetch fresh against the new token.
  const [switchMessage, setSwitchMessage] = useState<string | null>(null);

  const reloadAfterSwitch = (message: string) => {
    setSwitchMessage(message);
    setTimeout(() => window.location.reload(), 400);
  };

  // Calls the login API, persists the returned token, and updates auth
  // state on success; surfaces any failure as both a toast and reducer error.
  const submitLogin = async (credentials: object): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await login(credentials);
      if (response.token) {
        setToken(response.token);
        setUuid(response.uuid_token);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.data,
            token: response.token,
            uuid: response.uuid_token,
          },
        });
      } else {
        dispatch({ type: "LOGIN_FAILURE", payload: "No token received" });
      }
      return false;
    } catch (error) {
      // 423 means the account has 2FA enabled — the credentials were
      // correct, but a second factor (authenticator app code) is required
      // before the same /login call will succeed. Not an error: let the
      // caller prompt for the code and resubmit with it.
      if (axios.isAxiosError(error) && error.response?.status === 423) {
        dispatch({ type: "LOGIN_2FA_REQUIRED" });
        return true;
      }

      // Backend errors come back as `{ message }` on `response.data` for
      // known/handled failures (e.g. wrong password), or nested under
      // `response.data.errors.message` for uncaught server errors.
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
           error.response?.data?.error?.message ??
           error.message)
        : error instanceof Error
          ? error.message
          : "An error occurred";
      toast.error(errorMessage);
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return false;
    }
  };

  // Creates the account via POST /auth/customers/signup. This doesn't log
  // the customer in itself (the endpoint returns no token) — create-password
  // /index.tsx calls submitLogin right after this resolves to actually
  // authenticate. Re-throws on failure so that caller's try/catch stops
  // before attempting that login step.
  const submitSignup = async (credentials: object) => {
    dispatch({ type: "SIGNUP_START" });
    try {
      await signup(credentials as Parameters<typeof signup>[0]);
      dispatch({ type: "SIGNUP_SUCCESS" });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
           error.response?.data?.error?.message ??
           error.message)
        : error instanceof Error
          ? error.message
          : "An error occurred";
      toast.error(errorMessage);
      dispatch({ type: "SIGNUP_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Placeholder for the create-password flow; not yet wired up to an API
  // call, so it currently just logs the submitted credentials.
  const submitCreatePassword = async (credentials: object) => {
    console.log(credentials);
  };

  const submitForgotPasswordOtp = async (payload: { email: string; redirectUrl: string; gateway: string }) => {
    dispatch({ type: "FORGOT_PASSWORD_START" });
    try {
      const response = await requestForgotPasswordOtp(payload);
      dispatch({ type: "FORGOT_PASSWORD_SUCCESS" });
      return response;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
           error.response?.data?.error?.message ??
           error.message)
        : error instanceof Error
          ? error.message
          : "An error occurred";
      dispatch({ type: "FORGOT_PASSWORD_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const submitChangePassword = async (payload: ChangePasswordPayload) => {
    return changePassword(payload);
  };

  // Confirms a forgot-password OTP (as `token`) alongside the new password,
  // completing the reset requestForgotPasswordOtp/submitForgotPasswordOtp
  // started.
  const submitResetPassword = async (payload: ResetPasswordPayload) => {
    return resetPassword(payload);
  };

  const submitRequestEmailUpdate = async (email: string) => {
    return requestEmailUpdate(email);
  };

  const submitVerifyEmailUpdate = async (email: string, otp: string) => {
    return verifyEmailUpdate(email, otp);
  };

  // Notifies the backend the session is over, then clears the persisted
  // session (token + uuid) and resets auth state so the app falls back to
  // the logged-out UI. The local logout still happens even if the API call
  // fails (e.g. network issue, already-expired token) so the user is never
  // stuck unable to log out.
  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Ignore — local session is cleared regardless.
    }
    localStorage.removeItem("landlordStorageKey");
    localStorage.removeItem("uuid");
    localStorage.removeItem("primaryProfile");
    localStorage.removeItem("primaryBvn");
    dispatch({ type: "LOGOUT" });
    // Hard redirect to clear all contexts from memory to prevent data bleeding
    if (window.location.pathname !== "/auth/login") {
      window.location.href = "/auth/login";
    }
  };

  // Switches the active session to whichever profile targetCustomerId
  // belongs to — a plain replace of token + uuid, same call used in both
  // directions: a parent switching into a child's account, or a child
  // switching back by targeting the parent's own id (currentUser.parentId).
  // Nothing about the profile being switched away from is kept around —
  // switching again later just replaces it again, the same way logging in
  // as someone else would. Finishes with a full-page reload (see
  // reloadAfterSwitch's comment for why) rather than an in-place refetch.
  const submitSwitchProfile = async (targetCustomerId: string) => {
    dispatch({ type: "SWITCH_PROFILE_START" });
    try {
      // Same flat shape as the login response — token/uuid_token at the top
      // level, `data` is the switched-to profile itself (not nested under
      // data.token/data.user, which is what this read used to assume).
      const response = await switchProfile(targetCustomerId);
      setToken(response.token);
      setUuid(response.uuid_token);
      dispatch({
        type: "SWITCH_PROFILE_SUCCESS",
        payload: { token: response.token, uuid: response.uuid_token },
      });
      reloadAfterSwitch(`Switching to ${response.data.firstName}'s account...`);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
           error.response?.data?.error?.message ??
           error.message)
        : error instanceof Error
          ? error.message
          : "An error occurred";
      toast.error(errorMessage);
      dispatch({ type: "SWITCH_PROFILE_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Closes the "session expired" modal once the user has acknowledged it.
  const dismissSessionExpired = () => {
    dispatch({ type: "DISMISS_SESSION_EXPIRED" });
  };

  // Idle-session timeout: while authenticated, any mouse/keyboard/scroll
  // activity resets a 10-minute countdown and pings /auth/refresh to keep
  // the session alive server-side (throttled so continuous activity like
  // mousemove doesn't spam the endpoint). If no activity is seen for the
  // full 10 minutes, the session is treated as expired.
  useEffect(() => {
    if (!state.isAuthenticated) return;

    let idleTimeout: ReturnType<typeof setTimeout>;
    let lastRefreshAt = 0;

    const startIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        localStorage.removeItem("landlordStorageKey");
        localStorage.removeItem("uuid");
        localStorage.removeItem("primaryProfile");
        localStorage.removeItem("primaryBvn");
        dispatch({ type: "SESSION_TIMEOUT" });
      }, SESSION_TIMEOUT_MS);
    };

    const handleActivity = () => {
      startIdleTimer();

      const now = Date.now();
      if (now - lastRefreshAt < REFRESH_THROTTLE_MS) return;
      lastRefreshAt = now;
      refreshSession().catch(() => {
        // Ignore — the idle timer is the source of truth for expiry.
      });
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "mouseover",
      "keydown",
      "scroll",
      "touchstart",
    ] as const;

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );
    startIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [state.isAuthenticated]);

  // Attaches the current auth token as a Bearer header, plus the device's
  // persisted UUID as `x-uuid-token`, to every outgoing axios request.
  // Reads straight from localStorage on every request rather than closing
  // over state.token/state.uuid — those only reach a freshly-registered
  // closure on the next render, so a request fired in the gap right after
  // setToken()/setUuid() (e.g. submitSwitchProfile, or any effect that
  // fires an API call synchronously off a dispatch) could still go out
  // with the previous token and get a 401. localStorage is written
  // synchronously by setToken/setUuid, so reading it live here closes that
  // race entirely — registered once, no need to re-run on token/uuid change.
  useLayoutEffect(() => {
    const authInterceptor = axios.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem("landlordStorageKey");
      const currentUuid = localStorage.getItem("uuid");
      config.headers.Authorization = currentToken
        ? `Bearer ${currentToken}`
        : config.headers.Authorization;
      config.headers["x-uuid-token"] = currentUuid;
      config.headers["ngrok-skip-browser-warning"] = "69420";
      return config;
    });

    return () => {
      axios.interceptors.request.eject(authInterceptor);
    };
  }, []);

  // Watches for 401 (unauthorized) responses and treats them as an expired/
  // invalid session: clears the stale token from state + localStorage and
  // sends the user to the login page. Previously this only checked
  // `error.response.statusText === "Unauthorized"`, which real backends
  // rarely set (and HTTP/2 responses never carry a status text at all), so
  // it silently never fired — checking the status code alone is what
  // actually works. Uses a hard redirect (not react-router's navigate)
  // since this provider renders outside <BrowserRouter/> (see App.tsx).
  useLayoutEffect(() => {
    const authErrorInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("landlordStorageKey");
          localStorage.removeItem("uuid");
          localStorage.removeItem("primaryProfile");
          localStorage.removeItem("primaryBvn");
          dispatch({ type: "LOGOUT" });
          if (window.location.pathname !== "/auth/login") {
            window.location.href = "/auth/login";
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(authErrorInterceptor);
    };
  }, []);

  return (
    <>
      <AuthContext.Provider
        value={{
          state,
          dispatch,
          submitLogin,
          submitSignup,
          submitCreatePassword,
          submitForgotPasswordOtp,
          submitResetPassword,
          submitChangePassword,
          submitRequestEmailUpdate,
          submitVerifyEmailUpdate,
          logout,
          dismissSessionExpired,
          submitSwitchProfile,
        }}
      >
        <SessionExpired
          openSessionExpiredDialog={state.sessionExpired}
          onDismiss={dismissSessionExpired}
        />
        {switchMessage && <SwitchingOverlay message={switchMessage} />}
        {children}
      </AuthContext.Provider>
    </>
  );
}

// Hook for consuming the auth context; throws if used outside the Auth
// provider so misuse fails loudly instead of returning undefined silently.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
