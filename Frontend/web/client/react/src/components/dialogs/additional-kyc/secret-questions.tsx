import { useForm } from "react-hook-form";
import { secretQuestionsSchema } from "./additional-kyc-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import InputLabel from "../../atoms/input-with-label";
import Button from "../../atoms/buttons";
import FormSelectLabel from "../../atoms/select-with-label";

export interface SecretQuestionsDTO {
  secretQuestion: string;
  secretAnswer: string;
}

interface SecretQuestionsProps {
  initialData: Partial<SecretQuestionsDTO>;
  onNext: (data: SecretQuestionsDTO) => void;
}

// Mock array of secret question choices (This can also come from an API)
const SECRET_QUESTION_OPTIONS = [
  { value: "what_is_your_mother_s_maiden_name", label: "What is your mother's maiden name?" },
  { value: "what_is_your_favorite_color", label: "What is your favorite color?" },
  { value: "what_is_your_first_pet_s_name", label: "What is your first pet's name?" },
  { value: "what_is_your_hometown", label: "What is your hometown?" },
];

const SecretQuestions = ({ initialData, onNext }: SecretQuestionsProps) => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(secretQuestionsSchema),
    defaultValues: initialData as SecretQuestionsDTO,
  });

  return (
    <>
      <div className="form-wrapper mt-[68px] px-[24px]">
        <form className="" onSubmit={handleSubmit(onNext)}>
          <div className="form-group">
            <FormSelectLabel
              name="secretQuestion"
              control={control}
              label="Select a secret question"
              options={SECRET_QUESTION_OPTIONS}
              variant="outlined"
            />
          </div>

          <div className="form-group mt-[24px]">
            <InputLabel
              name="secretAnswer"
              control={control}
              label="Enter your secret answer"
              variant="outlined"
            />
          </div>

          <div className="text-center mt-[87px] text-[12px] text-[#BFBFBF] font-medium leading-[16px] tracking-[0.2px]">
            <span>
              You can easily update your preferences in your profile settings.
            </span>
          </div>

          <div>
            <Button
              variant="primary"
              disabled={false}
              isLoading={false}
              className="rounded-[99px] h-[56px] mt-[24px] text-[16px] font-semibold leading-[24px] tracking-[0.2px]"
              type="submit"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SecretQuestions;
