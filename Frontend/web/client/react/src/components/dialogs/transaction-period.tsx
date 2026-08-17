import Dialog from "@mui/material/Dialog";
import Label from "../atoms/labels";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { DatePickerInput } from "../atoms/date-picker";
import Button from "../atoms/buttons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";

// Quick date-range shortcuts shown above the manual pickers, so picking a
// common range doesn't require opening two calendars.
const DATE_PRESETS = [
  {
    label: "Today",
    getRange: (): [Date, Date] => [dayjs().toDate(), dayjs().toDate()],
  },
  {
    label: "Last 7 days",
    getRange: (): [Date, Date] => [
      dayjs().subtract(6, "day").toDate(),
      dayjs().toDate(),
    ],
  },
  {
    label: "Last 30 days",
    getRange: (): [Date, Date] => [
      dayjs().subtract(29, "day").toDate(),
      dayjs().toDate(),
    ],
  },
  {
    label: "This month",
    getRange: (): [Date, Date] => [
      dayjs().startOf("month").toDate(),
      dayjs().toDate(),
    ],
  },
] as const;

const schema = yup.object().shape({
  startDate: yup
    .date()
    .nullable()
    .required("Start date is required"),
  endDate: yup
    .date()
    .nullable()
    .required("End date is required")
    .min(
      yup.ref("startDate"),
      "End date cannot be earlier than start date"
    ),
});


interface PeriodProps {
  setPeriodDialog: (open: boolean) => void;
  openPeriodDialog: boolean;
  // Called with "YYYY-MM-DD" strings once a valid range is submitted.
  onApply: (startDate: string, endDate: string) => void;
  // Pre-fills the form with the currently-applied range (if any) so
  // reopening the dialog doesn't reset back to today/today.
  initialStartDate?: string;
  initialEndDate?: string;
}

interface PeriodFormData {
  startDate: Date;
  endDate: Date;
}

const Period = (props: PeriodProps) => {
  const { onApply, initialStartDate, initialEndDate } = props;

  const handleClose = () => {
    props.setPeriodDialog(false);
  };


    const { control, handleSubmit, watch, reset, setValue } = useForm<PeriodFormData>({
    resolver: yupResolver(schema),
    defaultValues: { startDate: new Date(), endDate: new Date() }
  });

  // Sync the form with whatever range is currently applied every time the
  // dialog opens, rather than always starting from today/today.
  useEffect(() => {
    if (!props.openPeriodDialog) return;
    reset({
      startDate: initialStartDate ? new Date(initialStartDate) : new Date(),
      endDate: initialEndDate ? new Date(initialEndDate) : new Date(),
    });
  }, [props.openPeriodDialog, initialStartDate, initialEndDate, reset]);

  // Use watch('startDate') to pass as minDate prop
  // to the end date picker for a better UX (disabling invalid dates).
  const selectedStartDate = watch("startDate");
  const selectedEndDate = watch("endDate");

  // Derived (not stored) so it stays correct even if the user tweaks a date
  // manually after clicking a preset — no extra state to keep in sync.
  const activePresetLabel = DATE_PRESETS.find((preset) => {
    const [start, end] = preset.getRange();
    return (
      selectedStartDate &&
      selectedEndDate &&
      dayjs(selectedStartDate).isSame(start, "day") &&
      dayjs(selectedEndDate).isSame(end, "day")
    );
  })?.label;

  const handlePresetClick = (preset: (typeof DATE_PRESETS)[number]) => {
    const [start, end] = preset.getRange();
    setValue("startDate", start, { shouldValidate: true });
    setValue("endDate", end, { shouldValidate: true });
  };

  const onSubmit = (data: PeriodFormData) => {
    // data will be a Dayjs object, so formatting it.
    const dateData = {
      startDate: (data.startDate).toISOString().split('T')[0],
      endDate: (data.endDate).toISOString().split('T')[0],
    };
    onApply(dateData.startDate, dateData.endDate);
    handleClose();
  };

  return (
    <>
      <Dialog
        open={props.openPeriodDialog}
        onClose={handleClose}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(0px)", // Apply the blur effect
              // background: "#0F0F0F", // Add a semi-transparent background
              opacity: "0.5",
            },
          },
          paper: {
            sx: {
              backgroundColor: "#fff", // Change the background color
              borderRadius: "16px", // Add rounded corners
              boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
              border: "1px solid #F4F4F4",
              padding: "32px",
              width: "596px",
            },
          },
        }}
      >
        <div>
          <div className="flex justify-end">
            <span
              className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[9px] py-[6px]"
              onClick={() => handleClose()}
            >
              <i className="ri-close-fill text-[24px] leading-[28px]"></i>
            </span>
          </div>
        </div>

        <div className="mt-[12px]">
          <h2 className="text-center text-[28px] font-semibold text-(--text-content-default) leading-[40px] tracking-[-0.3px]">
            Select a period
          </h2>
        </div>


          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-wrapper mt-[48px]">
              {/* Quick presets — covers the common cases in one click; the
                  pickers below are there for anything else. */}
              <div className="flex flex-wrap gap-[8px] mb-[24px]">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`px-[12px] py-[6px] rounded-[99px] text-[12px] font-semibold cursor-pointer transition-colors ${
                      activePresetLabel === preset.label
                        ? "bg-[#00585E] text-white"
                        : "bg-(--surface-subtle) text-(--text-content-default) border border-(--border-default)"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <Label name="Start date" />
                <DatePickerInput name="startDate" control={control} label="" />
              </div>

              <div className="form-group mt-[24px]">
                <Label name="End date" />
                <DatePickerInput name="endDate" control={control} label=""   
            
                // This disables dates in the UI picker
                   minDate={selectedStartDate ? dayjs(selectedStartDate) : undefined} />
              </div>

              <div>
                <Button
                  variant="primary"
                  disabled={false}
                  isLoading={false}
                  className="rounded-[99px] h-[56px] mt-[40px]"
                >
                  Continue
                </Button>
              </div>
            </div>
          </form>
      </Dialog>
    </>
  );
};

export default Period;
