import type { UserProfile } from "../models/userModel";

// The backend's own `verified` flag is the authoritative signal for
// whether Additional KYC (BVN, beneficiary, place of birth, mother's
// maiden name, etc.) is done — checked from the profile already held in
// memory so a plan/trade/investment can be gated behind finishing that
// step proactively, rather than only reacting once the backend rejects
// an action.
const isKycComplete = (user: UserProfile | null | undefined): boolean => {
  if (!user) return false;
  // A minor's email is a system-generated placeholder it can't log in with
  // or verify (see isAdditionalKycComplete's comment) — never treat one as
  // unverified on that basis.
  if (user.isMinor) return true;
  return user.verified === true;
};

export default isKycComplete;
