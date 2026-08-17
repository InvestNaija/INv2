import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useUser } from "../../../../contexts/userContext";
import { Dialog, Skeleton, CircularProgress } from "@mui/material";
import BankAccount from "../../../../components/dialogs/additional-kyc/bank-account";
import { updateBeneficiary } from "../../../../api/transactionService";

interface BankAccountData {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  bankCode?: string;
  isDefault?: boolean;
  active?: boolean;
}

const BankAccounts = () => {
  const { fetchBeneficiaries } = useUser();
  const [accounts, setAccounts] = useState<BankAccountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchBeneficiaries();
      const fetchedAccounts = response.data || [];
      const sortedAccounts = [...fetchedAccounts].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      setAccounts(sortedAccounts);
    } catch (error) {
      toast.error("Failed to load bank accounts.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchBeneficiaries]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAddAccount = () => {
    setIsAddAccountOpen(true);
  };

  const toggleMenu = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === accountId ? null : accountId);
  };

  const handleSetDefault = async (e: React.MouseEvent, account: BankAccountData) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setUpdatingAccountId(account.id);
    try {
      await updateBeneficiary({
        id: account.id,
        bankCode: account.bankCode || "044", // Fallback if missing
        bankName: account.bankName,
        active: account.active !== undefined ? account.active : true,
        isDefault: true,
        nuban: account.accountNumber,
        bankAccountName: account.accountName,
        redirectUrl: "https://app.investnaija.com/app/settings/bank-accounts"
      });
      toast.success("Bank account set as default successfully.");
      fetchAccounts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set default account.");
    } finally {
      setUpdatingAccountId(null);
    }
  };

  const handleDeleteAccount = (e: React.MouseEvent, accountId: string, isDefault?: boolean) => {
    e.stopPropagation();
    if (isDefault) {
      toast.error("You cannot delete your default bank account.");
      setActiveMenuId(null);
      return;
    }
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    setActiveMenuId(null);
    toast.success("Bank account removed successfully.");
  };

  return (
    <>
      <div className="w-full max-w-[720px] mt-[8px]">
        <div className="flex flex-col mb-[28px] gap-[4px]">
          <h2 className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none flex items-center gap-[12px]">
            Linked Accounts
            {!isLoading && (
              <span className="bg-[#F4F4F4] text-[#5A5A5A] text-[14px] font-bold px-[10px] py-[4px] rounded-[8px]">
                {accounts.length}
              </span>
            )}
          </h2>
          <p className="text-[15px] font-medium text-[#5A5A5A] leading-relaxed">
            Manage your bank accounts for withdrawals and funding.
          </p>
        </div>

        <div className="flex flex-col gap-[16px]">
          {isLoading ? (
            Array.from(new Array(2)).map((_, index) => (
              <div
                key={index}
                className="flex flex-row items-start sm:items-center justify-between p-[22px] bg-white rounded-[20px] border border-[#EAEAEA] relative"
              >
                <div className="flex items-start sm:items-center gap-[16px] w-full pr-[40px] sm:pr-0">
                  <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: '14px' }} className="shrink-0" />
                  <div className="flex flex-col gap-[8px] flex-1">
                    <Skeleton variant="text" width={150} height={20} />
                    <Skeleton variant="text" width={220} height={16} />
                  </div>
                </div>
                <div className="absolute right-[16px] top-[20px] sm:relative sm:top-auto sm:right-auto z-20 hidden sm:block">
                  <Skeleton variant="circular" width={40} height={40} />
                </div>
              </div>
            ))
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="group relative flex flex-row items-start sm:items-center justify-between p-[20px] bg-white rounded-[20px] border border-[#EAEAEA] hover:border-[#00868D] hover:shadow-[0_4px_20px_rgba(0,134,141,0.08)] transition-all duration-300"
              >
                <div className="flex items-start sm:items-center gap-[16px] relative z-10 w-full pr-[40px] sm:pr-0">
                  <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-[14px] bg-[#F4F4F4] group-hover:bg-[#F0FAFB] flex items-center justify-center text-[#5A5A5A] group-hover:text-[#00868D] transition-colors duration-300 shrink-0 border border-[#F0F0F0] mt-1 sm:mt-0">
                    <i className="ri-bank-fill text-[20px] sm:text-[24px]"></i>
                  </div>

                  <div className="flex flex-col gap-[6px] sm:gap-[4px] w-full">
                    <div className="flex flex-wrap items-center gap-[10px] sm:gap-[12px]">
                      <span className="text-[16px] sm:text-[18px] font-bold text-[#111111] tracking-tight">
                        {account.bankName}
                      </span>
                      {account.isDefault && (
                        <span className="bg-[#EAF6F7] text-[#00868D] text-[10px] font-bold uppercase tracking-widest px-[8px] py-[3px] rounded-md shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-[6px] sm:gap-[10px]">
                      <span className="text-[14px] sm:text-[14.5px] font-medium text-[#5A5A5A] line-clamp-1">
                        {account.accountName}
                      </span>
                      <div className="hidden sm:block w-[4px] h-[4px] rounded-full bg-[#D1D5DB]"></div>
                      
                      {/* Softer Account Number Display */}
                      <span className="flex items-center gap-[4px] bg-[#F7F7F7] px-[8px] py-[3px] rounded-[6px] border border-[#F0F0F0] text-[#111111] w-fit">
                        <span className="text-[16px] leading-none translate-y-[2px] font-bold text-[#8C98A4]">••••</span>
                        <span className="text-[13px] sm:text-[14px] font-mono font-semibold tracking-wider">
                          {account.accountNumber.slice(-4)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute right-[16px] top-[20px] sm:relative sm:top-auto sm:right-auto z-20">
                  {updatingAccountId === account.id ? (
                    <div className="w-[40px] h-[40px] flex items-center justify-center">
                      <CircularProgress size={20} sx={{ color: "#00868D" }} />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => toggleMenu(e, account.id)}
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#8C98A4] hover:text-[#111111] hover:bg-[#F4F4F4] transition-colors cursor-pointer"
                    >
                      <i className="ri-more-2-fill text-[20px]"></i>
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {activeMenuId === account.id && (
                    <div className="absolute top-[48px] right-0 w-[180px] bg-white border border-[#EAEAEA] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden py-[6px] z-50 animate-in fade-in zoom-in-95 duration-200">
                      {!account.isDefault && (
                        <button
                          onClick={(e) => handleSetDefault(e, account)}
                          disabled={updatingAccountId !== null}
                          className="w-full text-left px-[16px] py-[10px] flex items-center gap-[10px] text-[14px] font-medium text-[#111111] hover:bg-[#F4F4F4] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <i className="ri-star-line text-[16px]"></i>
                          Set as default
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteAccount(e, account.id, account.isDefault)}
                        className="w-full text-left px-[16px] py-[10px] flex items-center gap-[10px] text-[14px] font-medium text-[#E53E3E] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-[16px]"></i>
                        Remove account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Balanced Add Account Button */}
          <button
            onClick={handleAddAccount}
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-[20px] bg-transparent rounded-[20px] border border-dashed border-[#D1D5DB] hover:border-[#00868D] hover:bg-[#F0FAFB]/50 transition-all duration-300 cursor-pointer mt-[4px] w-full text-left"
          >
            <div className="flex items-start sm:items-center gap-[16px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-[#5A5A5A] group-hover:text-[#00868D] group-hover:border-[#00868D]/40 transition-all duration-300 shrink-0">
                <i className="ri-add-line text-[24px]"></i>
              </div>
              <div className="flex flex-col items-start gap-[2px] mt-1 sm:mt-0">
                <span className="text-[16px] font-bold text-[#111111] group-hover:text-[#00868D] transition-colors duration-300">
                  Link a new account
                </span>
                <span className="text-[14px] font-medium text-[#5A5A5A]">
                  Add a bank account to enable seamless deposits and withdrawals.
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <Dialog
        open={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(0px)",
              opacity: "0.5",
            },
          },
          paper: {
            sx: {
              backgroundColor: "var(--surface-default)",
              borderRadius: "24px",
              padding: { xs: "24px 0px", sm: "34px 0px" },
              width: { xs: "100%", sm: "560px" },
              maxWidth: "calc(100% - 32px)",
              margin: { xs: "16px", sm: "32px" },
            },
          },
        }}
      >
        <div className="flex justify-between items-center px-[24px] sm:px-[32px]">
          <h2 className="text-[20px] font-bold text-[#111111]">Link Bank Account</h2>
          <span
            className="text-(--text-content-default) cursor-pointer bg-(--surface-subtle) border border-(--border-default) rounded-[999px] px-[9px] py-[6px] hover:bg-[#F0F0F0] transition-colors"
            onClick={() => setIsAddAccountOpen(false)}
          >
            <i className="ri-close-fill text-[20px] leading-[28px]"></i>
          </span>
        </div>
        <BankAccount 
          initialData={{}}
          onNext={() => {
            setIsAddAccountOpen(false);
            fetchAccounts();
          }}
        />
      </Dialog>
    </>
  );
};

export default BankAccounts;
