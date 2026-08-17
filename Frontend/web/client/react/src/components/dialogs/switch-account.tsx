import { Dialog, type DialogProps, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import UserLogo from "../../assets/icons/user.svg";
import type { UserProfile } from "../../models/userModel";
import { useAuth } from "../../contexts/authContext";
import { useUser, type MinorAccount } from "../../contexts/userContext";
import { getCachedPrimaryProfile } from "../../hooks/primaryProfileCache";
import CreateMinorAccount from "./create-minor-account";

interface SwitchAccountProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
  currentUser: UserProfile | null | undefined;
}

// Colored initials avatars give each dependent row a distinct identity —
// without them, every dependent without a photo renders the same generic
// silhouette icon and rows become indistinguishable from a glance.
const avatarThemes = [
  { bg: "bg-[#FFF0E6]", text: "text-[#E77731]" },
  { bg: "bg-[#EBF4FF]", text: "text-[#3182CE]" },
  { bg: "bg-[#E6F8ED]", text: "text-[#38A169]" },
  { bg: "bg-[#F5EBFF]", text: "text-[#805AD5]" },
  { bg: "bg-[#FFFBE6]", text: "text-[#D69E2E]" },
];

const getAvatarTheme = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarThemes[Math.abs(hash) % avatarThemes.length];
};

// Capitalizes the raw relationship string ("son" -> "Son") for display.
const formatRelationship = (relationship: string | null) =>
  relationship ? relationship.charAt(0).toUpperCase() + relationship.slice(1) : null;

const AccountRow = ({
  name,
  subtitle,
  image,
  seed,
  isActive,
  isPrimaryAccount,
  isLoading,
  onClick,
}: {
  name: string;
  subtitle?: string | null;
  image?: string | null;
  // Used to derive a stable initials-avatar color/letter when there's no
  // profile photo — falls back to `name` when omitted.
  seed?: string;
  // The identity currently signed into — highlighted, checkmarked, and not
  // clickable (you're already there).
  isActive?: boolean;
  // Whether this row IS the root parent account — independent of isActive,
  // since the parent can show up here even while a dependent is active.
  isPrimaryAccount?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}) => {
  const theme = getAvatarTheme(seed || name || "?");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || isActive}
      className={`flex w-full items-center gap-[12px] rounded-[16px] border p-[12px] text-left transition-all duration-200 disabled:cursor-default ${
        isActive
          ? "border-[#00868D]/30 bg-[#F0FAFB]"
          : "cursor-pointer border-[#F0F0F0] hover:border-[#DCEEEF] hover:bg-[#FAFAFA] active:scale-[0.98] disabled:cursor-wait"
      }`}
    >
      <div className="relative shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-[44px] w-[44px] rounded-full object-cover border border-[#F0F0F0]"
          />
        ) : isPrimaryAccount ? (
          <img
            src={UserLogo}
            alt={name}
            className="h-[44px] w-[44px] rounded-full object-cover border border-[#F0F0F0]"
          />
        ) : (
          <div
            className={`flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[#F0F0F0] ${theme.bg}`}
          >
            <span className={`text-[16px] font-bold ${theme.text}`}>
              {name.trim().charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}
        {isActive && (
          <span className="absolute -bottom-[2px] -right-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#00868D] ring-2 ring-white">
            <i className="ri-check-line text-[11px] text-white"></i>
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-[#0F0F0F]" title={name}>
          {name}
        </p>
        {subtitle && (
          <p className="truncate text-[12px] text-[#8C8C8C]" title={subtitle}>
            {subtitle}
          </p>
        )}
        {(isPrimaryAccount || isActive) && (
          <span className="mt-[4px] inline-flex gap-[4px]">
            {isPrimaryAccount && (
              <span className="rounded-full bg-[#00868D]/10 px-[8px] py-[2px] text-[10px] font-bold uppercase tracking-[0.3px] text-[#00868D]">
                Primary account
              </span>
            )}
            {isActive && (
              <span className="rounded-full bg-[#F4F4F4] px-[8px] py-[2px] text-[10px] font-bold uppercase tracking-[0.3px] text-[#5A5A5A]">
                Current
              </span>
            )}
          </span>
        )}
      </div>
      {isLoading ? (
        <CircularProgress size={16} sx={{ color: "#00868D" }} />
      ) : onClick && !isActive ? (
        <i className="ri-arrow-right-s-line shrink-0 text-[20px] text-[#BFBFBF]"></i>
      ) : null}
    </button>
  );
};

const SwitchAccount = ({ openDialog, setDialog, currentUser }: SwitchAccountProps) => {
  const { submitSwitchProfile } = useAuth();
  const { fetchMinors } = useUser();

  // Driven by the currently-fetched profile, not any remembered client
  // state — switching to another profile is a plain token replace (see
  // authContext's submitSwitchProfile), so isMinor/parentId on whichever
  // profile is currently active is the only source of truth for this.
  const isViewingMinor = Boolean(currentUser?.isMinor);

  // The primary account's own name/email/image, cached in localStorage the
  // moment it's ever seen (see primaryProfileCache.ts) — there's no
  // endpoint for a minor to look up its own parent's profile, and a
  // component-local cache wouldn't survive the full-page reload a switch
  // triggers, so this is the only place left to read it from while
  // viewing as a minor. A session always starts on the primary account
  // before any switch happens, so this is populated by the time it's needed.
  const knownPrimary = getCachedPrimaryProfile();

  const [openCreateMinor, setOpenCreateMinor] = useState(false);
  const [minors, setMinors] = useState<MinorAccount[]>([]);
  const [isLoadingMinors, setIsLoadingMinors] = useState(false);
  // Which row's spinner to show right after it's clicked — authContext
  // takes over with its own full-screen overlay (and eventual reload) once
  // submitSwitchProfile actually resolves, so this only covers the brief
  // gap before that.
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  // Whether the dependents list has more content below the fold — drives
  // the bottom fade + "scroll for more" hint so a long list doesn't look
  // like it just ends abruptly.
  const dependentsListRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = () => {
    const el = dependentsListRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
  };

  useEffect(() => {
    updateScrollState();
  }, [minors]);

  // Only attempt to fetch dependents when viewing as the primary account.
  // A dependent is not allowed to switch to another dependent, so there's
  // no need to load the list and we just show a lone "back to primary" button.
  useEffect(() => {
    if (!openDialog || isViewingMinor) return;
    let cancelled = false;
    setIsLoadingMinors(true);
    fetchMinors()
      .then((data) => {
        if (!cancelled) setMinors(data);
      })
      .catch(() => {
        // Ignore — the dialog just falls back to showing no dependents.
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMinors(false);
      });
    return () => {
      cancelled = true;
    };
  }, [openDialog, fetchMinors, isViewingMinor]);

  const handleClose = () => setDialog(false);

  const handleDialogClose: DialogProps["onClose"] = () => setDialog(false);

  const handleAddDependent = () => {
    if (!currentUser?.verified) {
      toast.error("Please verify your email to create a dependent account.");
      return;
    }

    const isBvnDone = Boolean(currentUser?.bvn);
    const isPersonalDone =
      Boolean(currentUser?.mothersMaidenName) && Boolean(currentUser?.placeOfBirth);
    const isOthersDone = Boolean(currentUser?.occupation);
    const isBankDone = Boolean(currentUser?.nuban);
    const isKinDone = Boolean(currentUser?.nextOfKinName);

    const isKycComplete =
      isBvnDone && isPersonalDone && isOthersDone && isBankDone && isKinDone;

    if (!isKycComplete) {
      toast.error("Please complete your additional KYC to create a dependent account.");
      return;
    }

    setDialog(false);
    setOpenCreateMinor(true);
  };

  // Refreshes the dependents list and brings this dialog back so the newly
  // created dependent shows up right away, instead of leaving the user on
  // whatever screen the create-minor dialog closes to.
  const handleMinorCreated = async () => {
    try {
      const data = await fetchMinors();
      setMinors(data);
    } catch {
      // Ignore — reopening still lets the user retry via the fetch effect.
    }
    setDialog(true);
  };

  // One handler for every row — switching to a dependent and switching
  // back to the parent are the same call (see authContext's
  // submitSwitchProfile), just targeting a different id. On success it
  // takes over with its own full-screen overlay and reload, so there's
  // nothing left to do here afterward.
  const handleSwitchTo = async (targetId: string) => {
    const targetAccount = otherAccounts.find((acc) => acc.id === targetId);
    if (targetAccount && targetAccount.verified === false && targetAccount.status === "inactive") {
      toast.error("This account is inactive and not verified.");
      return;
    }

    setSwitchingId(targetId);
    try {
      await submitSwitchProfile(targetId);
    } catch {
      // submitSwitchProfile already surfaces a toast on failure.
      setSwitchingId(null);
    }
  };

  // Every OTHER account switchable to, besides whichever one is currently
  // active — the primary (only when it isn't already active) followed by
  // every fetched dependent except whichever one is currently active. The
  // primary's name/email/image come from knownPrimary when we have it
  // (we will, see its comment), falling back to a generic label only if
  // this dialog is somehow opened before ever having seen the primary.
  const otherAccounts = [
    ...(isViewingMinor && currentUser?.parentId
      ? [
          {
            id: currentUser.parentId,
            name: knownPrimary?.name || "Primary account",
            subtitle: knownPrimary?.email ?? null,
            image: knownPrimary?.image,
            seed: currentUser.parentId,
            isPrimaryAccount: true,
            verified: true,
            status: "active",
          },
        ]
      : []),
    ...(!isViewingMinor
      ? minors
          .filter((minor) => minor.id !== currentUser?.id)
          .map((minor) => ({
            id: minor.id,
            name: `${minor.firstName} ${minor.lastName}`,
            subtitle: formatRelationship(minor.relationship),
            image: minor.image,
            seed: minor.id,
            isPrimaryAccount: false,
            // minor object might not have verified typed strictly if it's not in MinorAccount interface,
            // but the API returns it as shown in the JSON, so we cast to any or use bracket notation
            verified: (minor as any).verified,
            status: minor.status,
          }))
      : []),
  ];

  return (
    <>
      <CreateMinorAccount
        openMinorDialog={openCreateMinor}
        setMinorDialog={setOpenCreateMinor}
        onSuccess={handleMinorCreated}
      />
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        slotProps={{
          backdrop: {
            sx: { backdropFilter: "blur(4px)", backgroundColor: "rgba(15, 15, 15, 0.45)" },
          },
          paper: {
            sx: {
              backgroundColor: "#fff",
              borderRadius: { xs: "24px", sm: "28px" },
              width: "440px",
              maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
              maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
              margin: { xs: "12px", sm: "32px" },
              overflowY: "auto",
              padding: { xs: "20px 16px", sm: "24px" },
            },
          },
        }}
      >
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F0F0F]">
          {isViewingMinor ? "Return to primary account" : "Switch account"}
        </h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F5F5F5] text-[#5A5A5A] transition-all hover:bg-[#EBEBEB] active:scale-90 cursor-pointer"
        >
          <i className="ri-close-line text-[16px]"></i>
        </button>
      </div>

      {isViewingMinor ? (
        <>
          <p className="mt-[4px] text-[13px] text-[#8C8C8C]">
            You are currently managing <strong>{`${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim()}</strong>'s account.
          </p>
          <div className="mt-[20px]">
            {otherAccounts.map((account) => (
              <AccountRow
                key={account.id}
                name={account.name}
                subtitle={account.subtitle}
                image={account.image}
                seed={account.seed}
                isPrimaryAccount={account.isPrimaryAccount}
                isLoading={switchingId === account.id}
                onClick={() => handleSwitchTo(account.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-[4px] text-[13px] text-[#8C8C8C]">
            Switch between your primary and dependent accounts, or add a new dependent.
          </p>

      <div className="mt-[20px] flex flex-col gap-[8px]">
        <AccountRow
          name={`${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You"}
          subtitle={currentUser?.email}
          image={currentUser?.image}
          isActive
          isPrimaryAccount={!isViewingMinor}
        />
      </div>

      <div className="mb-[8px] mt-[20px] flex items-center gap-[6px]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.3px] text-[#8C8C8C]">
          Other accounts
        </p>
        {otherAccounts.length > 0 && (
          <span className="rounded-full bg-[#F4F4F4] px-[7px] py-[1px] text-[11px] font-bold text-[#5A5A5A]">
            {otherAccounts.length}
          </span>
        )}
      </div>
      {isLoadingMinors ? (
        <div className="flex justify-center py-[12px]">
          <CircularProgress size={20} sx={{ color: "#00868D" }} />
        </div>
      ) : otherAccounts.length > 0 ? (
        <div className="relative">
          <div
            ref={dependentsListRef}
            onScroll={updateScrollState}
            className="flex max-h-[240px] flex-col gap-[8px] overflow-y-auto pr-[2px]"
          >
            {otherAccounts.map((account) => (
              <AccountRow
                key={account.id}
                name={account.name}
                subtitle={account.subtitle}
                image={account.image}
                seed={account.seed}
                isPrimaryAccount={account.isPrimaryAccount}
                isLoading={switchingId === account.id}
                onClick={() => handleSwitchTo(account.id)}
              />
            ))}
          </div>
          {/* Fades the last row and hints there's more to scroll to —
              fades out once the user has scrolled to the bottom. */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-[32px] items-end justify-center bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ${
              canScrollDown ? "opacity-100" : "opacity-0"
            }`}
          >
            <i className="ri-arrow-down-s-line mb-[2px] text-[16px] text-[#00868D]"></i>
          </div>
        </div>
      ) : (
        <p className="rounded-[16px] border border-dashed border-[#F0F0F0] bg-[#FAFAFA] px-[12px] py-[16px] text-center text-[13px] text-[#8C8C8C]">
          No other accounts yet — add a dependent below to manage their account from here.
        </p>
      )}

      <button
        type="button"
        onClick={handleAddDependent}
        className="mt-[20px] flex w-full items-center justify-center gap-[8px] rounded-[999px] border-2 border-dashed border-[#DCEEEF] bg-[#F5FBFB] py-[14px] text-[14px] font-semibold text-[#00868D] transition-all duration-200 hover:border-[#00868D]/50 hover:bg-[#EAF6F7] active:scale-[0.98] cursor-pointer"
      >
        <i className="ri-add-line text-[18px]"></i>
        Add a dependent
      </button>
    </>
  )}
      </Dialog>
    </>
  );
};

export default SwitchAccount;
