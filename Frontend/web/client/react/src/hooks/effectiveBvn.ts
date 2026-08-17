import type { UserProfile } from "../models/userModel";

const PRIMARY_BVN_KEY = "primaryBvn";

// Persists the primary (parent) account's BVN whenever its own profile is
// fetched, so it's still there after the full-page reload a profile switch
// triggers (see authContext's submitSwitchProfile) — nothing about a
// previous session is otherwise kept around across that reload.
export const cachePrimaryBvn = (user: UserProfile | null | undefined) => {
  if (user && !user.isMinor && user.bvn) {
    localStorage.setItem(PRIMARY_BVN_KEY, user.bvn);
  }
};

// A minor has no BVN of its own (see isAdditionalKycComplete's comment),
// but fund lookups (e.g. investments/details) require one as an actual API
// parameter, not just a completeness check — those fall back to the cached
// primary account's BVN while viewing as a minor.
export const getEffectiveBvn = (user: UserProfile | null | undefined): string | undefined => {
  if (user?.isMinor) {
    return localStorage.getItem(PRIMARY_BVN_KEY) || undefined;
  }
  return user?.bvn;
};
