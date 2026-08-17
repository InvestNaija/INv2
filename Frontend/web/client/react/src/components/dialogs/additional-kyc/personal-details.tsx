import { useForm } from "react-hook-form";
import { personalDetailsSchema } from "./additional-kyc-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import InputLabel from "../../atoms/input-with-label";
import Button from "../../atoms/buttons";

import { toast } from "react-toastify";
import { useState } from "react";
import { useUser } from "../../../contexts/userContext";

export interface PersonalDetailsDTO {
  mothersMaidenName: string;
  placeOfBirth: string;
}

interface PersonalDetailsProps {
  initialData: Partial<PersonalDetailsDTO>;
  onNext: (data: PersonalDetailsDTO) => void;
}

const PersonalDetails = ({ initialData, onNext }: PersonalDetailsProps) => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(personalDetailsSchema),
    defaultValues: initialData as PersonalDetailsDTO,
  });

  const { currentUser, submitUpdateProfile } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: PersonalDetailsDTO) => {
    setIsSubmitting(true);
    try {
      await submitUpdateProfile({
        mothersMaidenName: data.mothersMaidenName,
        placeOfBirth: data.placeOfBirth
      });
      toast.success("Profile updated successfully!");
      onNext(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-wrapper mt-[24px] px-[24px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <InputLabel
            name="mothersMaidenName"
            control={control}
            label="Enter your mother's maiden name"
            variant="outlined"
          />
        </div>

        <div className="form-group mt-[24px]">
          <InputLabel
            name="placeOfBirth"
            control={control}
            label="Enter your place of birth"
            variant="outlined"
          />
        </div>

        <div>
          <Button
            variant="primary"
            disabled={isSubmitting}
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

export default PersonalDetails;
