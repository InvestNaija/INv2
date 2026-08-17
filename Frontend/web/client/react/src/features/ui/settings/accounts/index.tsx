import { useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import KiddiesLogo from "../../../../assets/icons/kiddies.svg";
import Button from "../../../../components/atoms/buttons";
import CreateMinorAccount from "../../../../components/dialogs/create-minor-account";
import { useUser, type MinorAccount } from "../../../../contexts/userContext";
import { useAuth } from "../../../../contexts/authContext";

const avatarThemes = [
  { bg: "bg-[#EBF4FF]", text: "text-[#3182CE]", ring: "ring-[#3182CE]/20" },
  { bg: "bg-[#FFF0E6]", text: "text-[#E77731]", ring: "ring-[#E77731]/20" },
  { bg: "bg-[#E6F8ED]", text: "text-[#38A169]", ring: "ring-[#38A169]/20" },
  { bg: "bg-[#F5EBFF]", text: "text-[#805AD5]", ring: "ring-[#805AD5]/20" },
  { bg: "bg-[#FFFBE6]", text: "text-[#D69E2E]", ring: "ring-[#D69E2E]/20" },
];

const getAvatarTheme = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarThemes[Math.abs(hash) % avatarThemes.length];
};

const formatRelationship = (relationship: string | null) =>
  relationship ? relationship.charAt(0).toUpperCase() + relationship.slice(1) : "Dependent";

const Accounts = () => {
  const { fetchMinors } = useUser();
  const { submitSwitchProfile } = useAuth();
  const [openMinorDialog, setMinorDialog] = useState(false);
  const [minors, setMinors] = useState<MinorAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Which card's spinner to show right after it's clicked — authContext
  // takes over with its own full-screen overlay (and eventual reload) once
  // submitSwitchProfile actually resolves, so this only covers the brief
  // gap before that.
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const loadMinors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchMinors();
      setMinors(data);
    } catch {
      // Ignore — the section just falls back to showing no linked accounts.
    } finally {
      setIsLoading(false);
    }
  }, [fetchMinors]);

  useEffect(() => {
    loadMinors();
  }, [loadMinors]);

  const handleDialogOpen = () => {
    setMinorDialog(true);
  };

  // Lets a linked-account card double as a shortcut into that dependent's
  // profile, reusing the same switch-profile flow as the sidebar's Switch
  // Account dialog — turns this list from purely informational into
  // actually useful. On success it takes over with its own full-screen
  // overlay and reload, so there's nothing left to do here afterward.
  const handleSwitchToMinor = async (minor: MinorAccount) => {
    setSwitchingId(minor.id);
    try {
      await submitSwitchProfile(minor.id);
    } catch {
      // submitSwitchProfile already surfaces a toast on failure.
      setSwitchingId(null);
    }
  };

  return (
    <>
      <CreateMinorAccount
        openMinorDialog={openMinorDialog}
        setMinorDialog={setMinorDialog}
        onSuccess={loadMinors}
      />
      <div className="accounts-wrapper mt-[8px] w-full">
        <div className="w-full sm:w-[380px] bg-gradient-to-br from-[#F0FAFB] to-[#FAFAFA] rounded-[24px] border border-[#EAF6F7] p-[24px] shadow-[0_4px_20px_rgba(0,88,94,0.04)]">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <img src={KiddiesLogo} height="40" width="40" alt="Kiddies Logo" />
          </div>

          <div className="content-wrapper mt-[16px]">
            <div>
              <span className="text-[17px] font-bold text-[#0F0F0F]">
                Smart Kiddies Invest Account
              </span>
            </div>
            <div>
              <span className="text-[14px] leading-[20px] tracking-[0.1px] font-normal text-[#5a5a5a]">
                Create and easily manage an investment account for your little
                ones.
              </span>
            </div>
          </div>

          <div className="mt-[20px]">
            <Button
              variant="primary"
              disabled={false}
              isLoading={false}
              className="!bg-[#0F0F0F] rounded-[99px] py-[12px] px-[18px] text-[14px] leading-[20px] font-semibold !w-auto transition-transform duration-200 hover:!bg-[#1a1a1a] active:scale-[0.97]"
              onClick={handleDialogOpen}
            >
              <div className="flex gap-2 items-center">
                <span>Create account</span>{" "}
                <span>
                  <i className="ri-arrow-right-line text-[18px]"></i>
                </span>
              </div>
            </Button>
          </div>
        </div>

        <div className="linked-accounts-wrapper mt-[48px]">
          <div className="linked-accounts-header flex items-center gap-[8px]">
            <h3 className="text-[#0f0f0f] text-[16px] leading-[24px] font-semibold">
              Linked accounts
            </h3>
            {minors.length > 0 && (
              <span className="rounded-full bg-[#F4F4F4] px-[8px] py-[2px] text-[12px] font-bold text-[#5A5A5A]">
                {minors.length}
              </span>
            )}
          </div>

          <div className="linked-accounts-content mt-[24px] ">
            {isLoading ? (
              <div className="flex justify-center py-[24px]">
                <CircularProgress size={24} sx={{ color: "#00868D" }} />
              </div>
            ) : minors.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#F0F0F0] bg-[#FAFAFA] px-[20px] py-[28px] text-center">
                <p className="text-[14px] text-[#8C8C8C]">
                  You haven't linked any dependent accounts yet — create one above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
                {minors.map((minor) => {
                  const fullName = `${minor.firstName} ${minor.lastName}`.trim();
                  const theme = getAvatarTheme(minor.id || fullName || "?");
                  const isSwitching = switchingId === minor.id;
                  return (
                    <button
                      key={minor.id}
                      type="button"
                      onClick={() => handleSwitchToMinor(minor)}
                      disabled={isSwitching}
                      title={`Switch to ${fullName}'s account`}
                      className="group flex items-center gap-[12px] rounded-[20px] border border-[#F4F4F4] bg-white p-[16px] text-left transition-all duration-200 cursor-pointer hover:border-[#DCEEEF] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                    >
                      <div className="relative shrink-0">
                        {minor.image ? (
                          <img
                            src={minor.image}
                            alt={fullName}
                            className={`h-[48px] w-[48px] rounded-full object-cover ring-2 ring-offset-2 ${theme.ring}`}
                          />
                        ) : (
                          <div
                            className={`flex h-[48px] w-[48px] items-center justify-center rounded-full ring-2 ring-offset-2 ${theme.bg} ${theme.ring}`}
                          >
                            <span className={`text-[17px] font-bold ${theme.text}`}>
                              {minor.firstName?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <span
                          title="Verified"
                          className="absolute -bottom-[2px] -right-[2px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#00868D] ring-2 ring-white"
                        >
                          <i className="ri-check-line text-[11px] text-white"></i>
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-[#0F0F0F]" title={fullName}>
                          {fullName}
                        </p>
                        <span className="mt-[2px] inline-block rounded-full bg-[#00868D]/10 px-[8px] py-[2px] text-[11px] font-semibold text-[#00868D]">
                          {formatRelationship(minor.relationship)}
                        </span>
                      </div>

                      {isSwitching ? (
                        <CircularProgress size={16} sx={{ color: "#00868D" }} />
                      ) : (
                        <i className="ri-arrow-right-s-line shrink-0 text-[20px] text-[#BFBFBF] opacity-0 transition-opacity duration-200 group-hover:opacity-100"></i>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Accounts;
