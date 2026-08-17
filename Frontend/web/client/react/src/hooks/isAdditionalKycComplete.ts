import type { UserProfile } from "../models/userModel";

// Mirrors the backend's own Additional KYC completeness check — BVN,
// mother's maiden name, place of birth, at least one beneficiary/next-of-
// kin, NIN, and occupation. Separate from isKycComplete (which only checks
// email verification) since these gate two different modals: AccountVerification
// for an unverified email, AdditionalKyc for these fields.
// A minor account is already fully provisioned at creation time (bank
// details, documents, consent — all required fields on add-minor) and
// isn't obligated to have its own BVN/next-of-kin/occupation, so it's
// always treated as complete here rather than prompting for fields that
// don't apply to it.
const isAdditionalKycComplete = (user: UserProfile | null | undefined): boolean => {
  if (!user) return false;
  if (user.isMinor) return true;
  return !(
    !user.bvn ||
    !user.mothersMaidenName ||
    !user.placeOfBirth ||
    !user.nextOfKinName ||
    !user.nuban ||
    !user.occupation
  );
};

export default isAdditionalKycComplete;
