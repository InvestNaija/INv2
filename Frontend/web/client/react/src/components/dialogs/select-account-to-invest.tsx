import { Dialog, type DialogProps, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserLogo from "../../assets/icons/user.svg";
import type { UserProfile } from "../../models/userModel";
import { useAuth } from "../../contexts/authContext";
import { useUser, type MinorAccount } from "../../contexts/userContext";
import { getCachedPrimaryProfile } from "../../hooks/primaryProfileCache";

interface SelectAccountToInvestProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
  currentUser: UserProfile | null | undefined;
  targetAssetId: string;
  productType?: string;
}

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
  seed?: string;
  isActive?: boolean;
  isPrimaryAccount?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}) => {
  const theme = getAvatarTheme(seed || name || "?");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`flex w-full items-center gap-[12px] rounded-[16px] border p-[12px] text-left transition-all duration-200 ${
        isActive
          ? "border-[#00868D]/30 bg-[#F0FAFB] cursor-pointer hover:border-[#00868D]/50"
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
      ) : onClick ? (
        <i className="ri-arrow-right-s-line shrink-0 text-[20px] text-[#BFBFBF]"></i>
      ) : null}
    </button>
  );
};

const SelectAccountToInvest = ({
  openDialog,
  setDialog,
  currentUser,
  targetAssetId,
  productType,
}: SelectAccountToInvestProps) => {
  const { submitSwitchProfile } = useAuth();
  const { fetchMinors } = useUser();
  const navigate = useNavigate();

  const isViewingMinor = Boolean(currentUser?.isMinor);
  const knownPrimary = getCachedPrimaryProfile();

  const [minors, setMinors] = useState<MinorAccount[]>([]);
  const [isLoadingMinors, setIsLoadingMinors] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!openDialog || isViewingMinor) return;
    let cancelled = false;
    setIsLoadingMinors(true);
    fetchMinors()
      .then((data) => {
        if (!cancelled) setMinors(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingMinors(false);
      });
    return () => {
      cancelled = true;
    };
  }, [openDialog, fetchMinors, isViewingMinor]);

  const handleClose = () => setDialog(false);
  const handleDialogClose: DialogProps["onClose"] = () => setDialog(false);

  const handleSelectAccount = async (targetId: string, isCurrent: boolean) => {
    const urlParams = productType ? `?productType=${productType}` : "";
    
    if (isCurrent) {
      setDialog(false);
      navigate(`/app/invest/investments/details/${targetAssetId}${urlParams}`);
      return;
    }

    const targetAccount = otherAccounts.find((acc) => acc.id === targetId);
    if (targetAccount && targetAccount.verified === false && targetAccount.status === "inactive") {
      toast.error("This account is inactive and not verified.");
      return;
    }

    setSwitchingId(targetId);
    try {
      localStorage.setItem("postSwitchRedirectUrl", `/app/invest/investments/details/${targetAssetId}${urlParams}`);
      await submitSwitchProfile(targetId);
    } catch {
      setSwitchingId(null);
      localStorage.removeItem("postSwitchRedirectUrl");
    }
  };

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
            verified: (minor as any).verified,
            status: minor.status,
          }))
      : []),
  ];

  return (
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
          Select account to invest
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

      <p className="mt-[4px] text-[13px] text-[#8C8C8C]">
        Choose which account you are making this investment for.
      </p>

      <div className="mt-[20px] flex flex-col gap-[8px]">
        <AccountRow
          name={`${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You"}
          subtitle={currentUser?.email}
          image={currentUser?.image}
          isActive
          isPrimaryAccount={!isViewingMinor}
          onClick={() => handleSelectAccount(currentUser?.id as string, true)}
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
                onClick={() => handleSelectAccount(account.id, false)}
              />
            ))}
          </div>
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
          No other accounts found. You can add a dependent from the main Switch Account menu.
        </p>
      )}
    </Dialog>
  );
};

export default SelectAccountToInvest;
