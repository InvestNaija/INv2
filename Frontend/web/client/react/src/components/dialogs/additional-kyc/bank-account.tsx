import { useForm } from "react-hook-form";
import { bankAccountSchema } from "./additional-kyc-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import InputLabel from "../../atoms/input-with-label";
import Button from "../../atoms/buttons";
import { Controller } from "react-hook-form";
import { CircularProgress, InputAdornment } from "@mui/material";
import SearchableFormSelectLabel from "../../atoms/searchable-select-with-label";
import { type SelectOption } from "../../atoms/select-with-label";
import { useUser } from "../../../contexts/userContext";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";



export interface BankAccountDTO {
    bankName: string;
    bankAccountNumber: string;

}

interface BankAccountProps {
  initialData: Partial<BankAccountDTO>;
  onNext: (data: BankAccountDTO) => void;
}




const BankAccount = ({ initialData, onNext }: BankAccountProps) => {
  const { control, handleSubmit, watch } = useForm({
    resolver: yupResolver(bankAccountSchema),
    defaultValues: initialData as BankAccountDTO
  });
  const { fetchBanksList, verifyUserBankAccount, submitAddBeneficiary } = useUser();
  const [bankOptions, setBankOptions] = useState<SelectOption[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const bankName = watch("bankName");
  const bankAccountNumber = watch("bankAccountNumber");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: BankAccountDTO) => {
    if (verifiedName) {
      setIsSubmitting(true);
      try {
        const selectedBank = bankOptions.find(b => String(b.value) === String(data.bankName));
        await submitAddBeneficiary({
          bankAccountName: verifiedName,
          nuban: data.bankAccountNumber,
          bankCode: String(data.bankName),
          bankName: String(selectedBank?.label || ""),
          isDefault: false,
          isDirectDebit: false,
          redirectUrl: "https://app.investnaija.com/app/settings/bank-accounts"
        });
        toast.success("Beneficiary added successfully!");
        onNext(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to submit beneficiary.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please wait for your account to be verified before continuing.");
    }
  };

  useEffect(() => {
    const verifyAutomatically = async () => {
      if (bankName && bankAccountNumber?.length === 10) {
        setIsVerifying(true);
        setVerifiedName(null);
        try {
          // Add a 1.5s delay to ensure the loader is visible to the user
          await new Promise(resolve => setTimeout(resolve, 1500));
          const response = await verifyUserBankAccount({
            nuban: bankAccountNumber,
            bank_code: bankName
          });
          const accountName = response?.data?.account_name || response?.account_name || response?.name;
          if (accountName) {
            setVerifiedName(accountName);
            toast.success("Bank account verified successfully!");
          } else {
            toast.error("Account verification failed: Account name not found.");
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || "Failed to verify bank account.");
        } finally {
          setIsVerifying(false);
        }
      } else {
        setVerifiedName(null);
      }
    };

    const timeoutId = setTimeout(() => {
      verifyAutomatically();
    }, 500); // 500ms debounce to prevent spamming if user types fast or pastes

    return () => clearTimeout(timeoutId);
  }, [bankName, bankAccountNumber]);

  useEffect(() => {
    let cancelled = false;
    const fetchBanks = async () => {
      try {
        const response = await fetchBanksList();
        const banksList = Array.isArray(response) ? response : (response?.data || []);
        if (!cancelled) {
          const options = banksList.map((b: any) => ({
            value: b.code || b.id || b.name,
            label: b.name
          }));
          setBankOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch banks", error);
      } finally {
        if (!cancelled) setIsLoadingBanks(false);
      }
    };
    fetchBanks();
    return () => { cancelled = true; };
  }, []);    return (
        <>
         <div className="form-wrapper mt-[24px] px-[24px]">
              <form className="" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <SearchableFormSelectLabel
                    name="bankName"
                    control={control}
                    label="Select your bank"
                    options={bankOptions}
                    variant="outlined"
                    disabled={isLoadingBanks}
                  />
                </div>

                 <div className="form-group mt-[24px]">
                  <InputLabel
                    name="bankAccountNumber"
                    control={control}
                    label="Enter your bank account number"
                    variant="outlined"
                  />
                  {isVerifying && (
                    <div className="mt-2 text-[#00868D] text-[14px] font-semibold leading-[20px] bg-[#E5F5F6] p-3 rounded-lg border border-[#D3EEF0] flex items-center gap-2">
                      <i className="ri-loader-4-line animate-spin text-[18px]"></i>
                      Verifying account details...
                    </div>
                  )}
                  {verifiedName && !isVerifying && (
                    <div className="mt-2 text-[#008940] text-[14px] font-semibold leading-[20px] bg-[#E8F5E9] p-3 rounded-lg border border-[#A5D6A7] flex items-center gap-2">
                      <i className="ri-check-line text-[18px]"></i>
                      {verifiedName}
                    </div>
                  )}
                </div>

                <div>
                  <Button
                    variant="primary"
                    disabled={!verifiedName || isVerifying || isLoadingBanks || isSubmitting}
                    isLoading={isSubmitting}
                    className="rounded-[99px] h-[56px] mt-[24px] text-[16px] font-semibold leading-[24px] tracking-[0.2px] transition-transform active:scale-[0.98]"
                    type="submit"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </div>
        
        </>
    )
}

export default BankAccount;