import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { othersSchema } from "./additional-kyc-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import InputLabel from "../../atoms/input-with-label";
import { type SelectOption } from "../../atoms/select";
import FormSelectLabel from "../../atoms/select-with-label";
import Button from "../../atoms/buttons";
import { toast } from "react-toastify";
import { useUser } from "../../../contexts/userContext";

export interface OthersDTO {
  occupation: string;
  sourceOfIncome: string;
}

interface OthersProps {
  initialData: Partial<OthersDTO>;
  onNext: (data: OthersDTO) => void;
}

const Others = ({ initialData, onNext }: OthersProps) => {
  const { currentUser, fetchSourceOfFunds, submitUpdateAdditionalKyc } = useUser();
  
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(othersSchema),
    defaultValues: initialData as OthersDTO,
  });

  const [sourceOfIncomeOptions, setSourceOfIncomeOptions] = useState<SelectOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: OthersDTO) => {
    setIsSubmitting(true);
    try {
      const selectedOption = sourceOfIncomeOptions.find(opt => String(opt.value) === String(data.sourceOfIncome));
      const payload = {
        bvn: currentUser?.bvn,
        mothersMaidenName: currentUser?.mothersMaidenName,
        placeOfBirth: currentUser?.placeOfBirth,
        bankAccountNumber: currentUser?.nuban,
        bankName: currentUser?.beneficiary?.bankName || "",
        nextOfKinName: currentUser?.nextOfKinName,
        nextOfKinPhone: currentUser?.nextOfKinPhone,
        nextOfKinRelationship: currentUser?.nextOfKinRelationship,
        nextOfKinAddress: currentUser?.nextOfKinAddress,
        ...initialData,
        occupation: data.occupation,
        sourceOfFunds: selectedOption?.label || data.sourceOfIncome
      };
      
      if ('sourceOfIncome' in payload) {
        delete (payload as any).sourceOfIncome;
      }

      
      await submitUpdateAdditionalKyc(payload);
      toast.success("Details updated successfully!");
      onNext(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to submit details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchOptions = async () => {
      try {
        const options = await fetchSourceOfFunds();
        if (!cancelled) setSourceOfIncomeOptions(options);
      } catch {
        // Non-critical — the field just won't have options to pick from.
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    };

    fetchOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="form-wrapper mt-[24px] px-[24px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <InputLabel
            name="occupation"
            control={control}
            label="Enter your occupation"
            variant="outlined"
          />
        </div>

        <div className="form-group mt-[24px]">
          <FormSelectLabel
            name="sourceOfIncome"
            control={control}
            label="Select your source of income"
            options={sourceOfIncomeOptions}
            disabled={isLoadingOptions}
          />
        </div>

        <div>
          <Button
            variant="primary"
            disabled={isSubmitting || isLoadingOptions}
            isLoading={isSubmitting}
            className="rounded-[99px] h-[56px] mt-[24px] text-[16px] font-semibold leading-[24px] tracking-[0.2px] transition-transform active:scale-[0.98]"
            type="submit"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Others;
