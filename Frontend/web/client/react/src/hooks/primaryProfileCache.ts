import type { UserProfile } from "../models/userModel";

const PRIMARY_PROFILE_KEY = "primaryProfile";

export interface PrimaryProfileSnapshot {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

// Persists the primary (parent) account's display info whenever its own
// profile is fetched, so it's still there after the full-page reload a
// profile switch triggers (see authContext's submitSwitchProfile) — a
// minor has no way to look up its own parent's profile, and in-memory
// component state doesn't survive that reload, so this is the only place
// left to read it from while viewing as a minor. Same pattern as
// effectiveBvn.ts's primary-BVN cache.
export const cachePrimaryProfile = (user: UserProfile | null | undefined) => {
  if (user && !user.isMinor && user.id) {
    const snapshot: PrimaryProfileSnapshot = {
      id: user.id,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      email: user.email,
      image: user.image,
    };
    localStorage.setItem(PRIMARY_PROFILE_KEY, JSON.stringify(snapshot));
  }
};

export const getCachedPrimaryProfile = (): PrimaryProfileSnapshot | null => {
  const raw = localStorage.getItem(PRIMARY_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PrimaryProfileSnapshot;
  } catch {
    return null;
  }
};
