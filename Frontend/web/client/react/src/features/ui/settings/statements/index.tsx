import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import Label from "../../../../components/atoms/labels";
import { DatePickerInput } from "../../../../components/atoms/date-picker";
import Button from "../../../../components/atoms/buttons";
import FormSelect, { type SelectOption } from "../../../../components/atoms/select";

const schema = yup.object().shape({
  startDate: yup.date().nullable().required("Start date is required"),
  endDate: yup
    .date()
    .nullable()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date cannot be earlier than start date"),
  statementsType: yup.string().required("Statement type is required"),
});

interface StatementsFormData {
  startDate: Date;
  endDate: Date;
  statementsType: string;
}

const Statements = () => {
  const { control, handleSubmit, watch } = useForm<StatementsFormData>({
    resolver: yupResolver(schema),
    defaultValues: { startDate: new Date(), endDate: new Date(), statementsType: '' },
  });

  const selectedStartDate = watch("startDate");

  const statementTypeOptions: SelectOption[] = [
    { value: "saveplan", label: "Save Plan" },
    { value: "invest", label: "Investment" },
  ];

  const onSubmit = (data: StatementsFormData) => {
    const dateData = {
      startDate: data.startDate.toISOString().split("T")[0],
      endDate: data.endDate.toISOString().split("T")[0],
      statementType: data.statementsType
    };
  };

  return (
    <>
      <div className="w-full max-w-[720px] mt-[8px]">
        <div className="flex flex-col mb-[28px] gap-[4px]">
          <h2 className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none">
            Statements
          </h2>
          <p className="text-[15px] font-medium text-[#5A5A5A] leading-relaxed">
            Generate and download your transaction history.
          </p>
        </div>
        
        <div className="p-[28px] sm:p-[32px] bg-white rounded-[24px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,134,141,0.04)]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-[24px]">
              
              {/* Date Pickers side-by-side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                <div className="flex flex-col gap-[8px]">
                  <Label name="Start Date" className="text-[15px] font-bold text-[#111111]" />
                  <DatePickerInput name="startDate" control={control} label="" />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <Label name="End Date" className="text-[15px] font-bold text-[#111111]" />
                  <DatePickerInput
                    name="endDate"
                    control={control}
                    label=""
                    minDate={selectedStartDate ? dayjs(selectedStartDate) : undefined}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[8px]">
                <Label name="Statement Type" className="text-[15px] font-bold text-[#111111]" />
                <FormSelect
                  name="statementsType"
                  control={control}
                  label=""
                  options={statementTypeOptions}
                />
              </div>

              <div className="mt-[8px] pt-[24px] border-t border-[#F0F0F0]">
                <Button
                  variant="primary"
                  disabled={false}
                  isLoading={false}
                  className="rounded-[16px] h-[56px] w-full text-[16px] font-bold bg-[#00868D] hover:bg-[#007075] transition-colors shadow-sm"
                >
                  Generate Statement
                </Button>
              </div>
              
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Statements;
