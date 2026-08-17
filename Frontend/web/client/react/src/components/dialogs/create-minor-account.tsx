import Dialog from "@mui/material/Dialog";
import { useForm } from "react-hook-form";
import Button from "../atoms/buttons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useRef, useState, useMemo } from "react";
import InputLabel from "../atoms/input-with-label";
import { type SelectOption } from "../atoms/select-with-label";
import DatePickerInputLabel from "../atoms/date-picker-with-label";
import dayjs, { type Dayjs } from "dayjs";
import FormSelectLabel from "../atoms/select-with-label";
import Checkbox from "../atoms/checkbox";
import { useUser } from "../../contexts/userContext";
import { toast } from "react-toastify";

const TOTAL_STEPS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// One entry per step — drives the circular progress ring, the title in the
// pill beside it, and the gradient icon badge above each step's heading.
// Distinct (but harmonious) colors per step read as real progress through a
// journey rather than four identical screens, the same way custom-plan-modal's
// single-color ring reads as progress through *a* journey — here each leg
// gets its own identity.
const STEPS = [
  { title: "Basic Info", icon: "ri-user-smile-line", from: "#FF9B5E", to: "#E77731", badgeBg: "#FCDCA5" },
  { title: "About Them", icon: "ri-cake-2-line", from: "#5EC8CD", to: "#00868D", badgeBg: "#CFEFF1" },
  { title: "Documents", icon: "ri-file-shield-2-line", from: "#B794F4", to: "#805AD5", badgeBg: "#E9DDFB" },
] as const;

const schema = yup.object().shape({
  firstName: yup.string().required("Child's first name is required"),
  lastName: yup.string().required("Child's last name is required"),
  relationship: yup.string().required("Relationship with child is required"),
  gender: yup.string().required("Child's gender is required"),
  dob: yup
    .mixed<Dayjs>()
    .required("Date of birth is required")
    .test(
      "is-minor",
      "Please enter a valid date of birth — the child must be under 18",
      (value) => !!value && value.isValid() && dayjs().diff(value, "year") < 18,
    ),
  nin: yup
    .string()
    .required("Child's NIN is required")
    .matches(/^\d{11}$/, "Please enter a valid 11-digit NIN"),
  mothersMaidenName: yup.string().required("Child's mother's maiden name is required"),
});

interface MinorProps {
  setMinorDialog: (open: boolean) => void;
  openMinorDialog: boolean;
  // Called after a minor account is created successfully, so callers can
  // refresh whatever list (switch-account dialog, settings/accounts page)
  // is showing linked accounts.
  onSuccess?: () => void;
}

interface MinorFormData {
  dob: Dayjs;
  firstName: string;
  lastName: string;
  relationship: string;
  gender: string;
  nin: string;
  mothersMaidenName: string;
}

const stepFields: Record<number, (keyof MinorFormData)[]> = {
  0: ["firstName", "lastName", "relationship"],
  1: ["dob", "gender", "nin", "mothersMaidenName"],
};

// The circular step-progress ring + title pill used in the header — same
// glass-pill/gradient-ring language as custom-plan-modal.tsx's stepper, so
// the two multi-step flows in the app feel like one product.
const StepRing = ({ step }: { step: (typeof STEPS)[number] & { index: number } }) => (
  <div className="inline-flex items-center gap-[12px] bg-white/95 backdrop-blur-2xl px-[20px] py-[10px] rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
    <div className="relative h-[36px] w-[36px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <defs>
          <linearGradient id={`minor-step-gradient-${step.index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={step.from} />
            <stop offset="100%" stopColor={step.to} />
          </linearGradient>
        </defs>
        <path
          className="text-[#00585E]/10"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          strokeDasharray={`${((step.index + 1) / TOTAL_STEPS) * 100}, 100`}
          strokeLinecap="round"
          strokeWidth="3.5"
          stroke={`url(#minor-step-gradient-${step.index})`}
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#111111]">{step.index + 1}</span>
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold text-[#9B9B9B] uppercase tracking-wider mb-0.5">
        Step {step.index + 1} of {TOTAL_STEPS}
      </span>
      <span className="text-[13px] font-bold text-[#111111] leading-none">{step.title}</span>
    </div>
  </div>
);

const CreateMinorAccount = (props: MinorProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitAddMinor } = useUser();

  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const birthCertificateInputRef = useRef<HTMLInputElement>(null);
  const passportPhotoInputRef = useRef<HTMLInputElement>(null);

  // Thumbnail previews for the two upload rows — PDFs (birth certificate
  // only) have no image to preview, so those fall back to the file icon.
  // Regenerated whenever the underlying file changes, and revoked on the
  // way out so object URLs don't leak.
  const birthCertificatePreview = useMemo(
    () => (birthCertificate && birthCertificate.type !== "application/pdf" ? URL.createObjectURL(birthCertificate) : null),
    [birthCertificate],
  );
  const passportPhotoPreview = useMemo(
    () => (passportPhoto ? URL.createObjectURL(passportPhoto) : null),
    [passportPhoto],
  );

  useEffect(() => {
    return () => {
      if (birthCertificatePreview) URL.revokeObjectURL(birthCertificatePreview);
    };
  }, [birthCertificatePreview]);

  useEffect(() => {
    return () => {
      if (passportPhotoPreview) URL.revokeObjectURL(passportPhotoPreview);
    };
  }, [passportPhotoPreview]);

  const relationshipOptions: SelectOption[] = [
    { value: "son", label: "Son" },
    { value: "daughter", label: "Daughter" },
    { value: "nephew", label: "Nephew" },
    { value: "niece", label: "Niece" },
    // { value: "other", label: "Other" },
  ];

  const genderOptions: SelectOption[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    // { value: "other", label: "Other" },
  ];

  const { control, handleSubmit, trigger, reset } = useForm<MinorFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      relationship: "",
      dob: dayjs(null),
      gender: "",
      nin: "",
      mothersMaidenName: "",
    },
    mode: "onChange",
  });

  const handleClose = () => {
    props.setMinorDialog(false);
    setTimeout(() => {
      setActiveStep(0);
      setBirthCertificate(null);
      setPassportPhoto(null);
      setConsent(false);
      reset();
    }, 300);
  };

  const handleNext = async () => {
    const fields = stepFields[activeStep];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      handleClose();
    }
  };

  const handleFileSelect = (
    file: File | undefined,
    setFile: (file: File) => void,
  ) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "application/pdf"].includes(file.type)) {
      toast.error("Only PNG, JPG or PDF files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File must be less than 5MB.");
      return;
    }
    setFile(file);
  };

  const onSubmit = async (data: MinorFormData) => {
    if (!birthCertificate || !passportPhoto) {
      toast.error("Please upload both the birth certificate and passport photo.");
      return;
    }
    if (!consent) {
      toast.error("Please agree to the Terms & Conditions to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("relationship", data.relationship);
    formData.append("dob", data.dob.format("YYYY-MM-DD"));
    formData.append("gender", data.gender);
    formData.append("nin", data.nin);
    formData.append("motherMaidenName", data.mothersMaidenName);
    formData.append("consent", "true");
    formData.append("birthCertificate", birthCertificate);
    formData.append("passportPhoto", passportPhoto);

    setIsSubmitting(true);
    try {
      await submitAddMinor(formData);
      toast.success("Minor account created successfully!");
      props.onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to create minor account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const termsLink = (
    <span className="ml-2 text-[#8C8C8C] text-[13px] font-medium leading-[18px] tracking-[0.2px]">
      I have read and agree to the
      <a href="google.com" className="text-[#0E47D8] font-semibold">
        {" "}
        Terms &amp; Conditions.{" "}
      </a>
    </span>
  );

  const currentStep = { ...STEPS[activeStep], index: activeStep };

  return (
    <>
      <Dialog
        open={props.openMinorDialog}
        onClose={handleClose}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(15, 15, 15, 0.5)",
            },
          },
          paper: {
            sx: {
              backgroundColor: "#fff",
              borderRadius: { xs: "24px", sm: "28px" },
              boxShadow: "0px 32px 80px rgba(0, 0, 0, 0.14)",
              border: "1px solid #F4F4F4",
              padding: { xs: "20px 16px", sm: "32px 40px" },
              width: "596px",
              maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
              maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
              margin: { xs: "12px", sm: "32px" },
              overflowY: "auto",
            },
          },
        }}
      >
        {/* Persistent chrome shared across every step — back arrow (or
            close, on step 0), the circular step-progress pill, and close —
            hoisted out of the per-step blocks below so it stays perfectly
            stable instead of re-mounting (and re-animating) on every step
            change. */}
        <div className="flex items-center justify-between">
          {activeStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#F0F0F0] cursor-pointer transition-all hover:bg-[#F0F0F0] active:scale-90"
            >
              <i className="ri-arrow-left-s-line text-[20px]"></i>
            </button>
          ) : (
            <span className="w-[40px]" />
          )}

          <StepRing step={currentStep} />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#F0F0F0] cursor-pointer transition-all hover:bg-[#F0F0F0] active:scale-90"
          >
            <i className="ri-close-line text-[20px]"></i>
          </button>
        </div>

        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              {activeStep === 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col items-center mt-[28px]">
                    <div
                      className="p-[10px] rounded-[22px] mb-[16px] shadow-sm"
                      style={{ backgroundColor: STEPS[0].badgeBg }}
                    >
                      <div
                        className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border-4 border-white/40"
                        style={{ background: `linear-gradient(135deg, ${STEPS[0].from}, ${STEPS[0].to})` }}
                      >
                        <i className={`${STEPS[0].icon} text-white text-[26px]`}></i>
                      </div>
                    </div>
                    <h2 className="text-center text-[22px] sm:text-[26px] font-bold text-(--text-content-default) leading-[30px] sm:leading-[34px] tracking-[-0.3px]">
                      Let's get you on your way
                    </h2>
                    <p className="text-center text-[13px] sm:text-[15px] font-normal text-(--text-content-subtle) leading-[20px] mt-[4px]">
                      Who are we setting this account up for?
                    </p>
                  </div>

                  <div className="form-wrapper mt-[32px]">
                    <div className="form-group">
                      <InputLabel
                        name="firstName"
                        control={control}
                        label="Child's first name"
                        variant="outlined"
                      />
                    </div>

                    <div className="form-group mt-[24px]">
                      <InputLabel
                        name="lastName"
                        control={control}
                        label="Child's last name"
                        variant="outlined"
                      />
                    </div>

                    <div className="form-group mt-[24px]">
                      <FormSelectLabel
                        name="relationship"
                        control={control}
                        label="Relationship with child"
                        options={relationshipOptions}
                        variant="outlined"
                      />
                    </div>

                    <div className="mt-[20px] flex items-start gap-[8px] rounded-[14px] bg-[#FAFAFA] border border-[#F4F4F4] px-[14px] py-[12px]">
                      <i className="ri-information-line text-[16px] text-[#9B9B9B] mt-[1px] shrink-0"></i>
                      <span className="text-(--text-content-muted) text-[12px] font-medium leading-[17px] tracking-[0.2px]">
                        Ensure your child's name appears as is on official
                        documents or IDs and must be below 18 years of age.
                      </span>
                    </div>

                    <div>
                      <Button
                        type="button"
                        onClick={handleNext}
                        variant="primary"
                        disabled={false}
                        isLoading={false}
                        className="rounded-[99px] h-[56px] mt-[24px] text-[16px] font-semibold shadow-[0_8px_20px_rgba(0,88,94,0.18)] transition-transform active:scale-[0.98]"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col items-center mt-[28px]">
                    <div
                      className="p-[10px] rounded-[22px] mb-[16px] shadow-sm"
                      style={{ backgroundColor: STEPS[1].badgeBg }}
                    >
                      <div
                        className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border-4 border-white/40"
                        style={{ background: `linear-gradient(135deg, ${STEPS[1].from}, ${STEPS[1].to})` }}
                      >
                        <i className={`${STEPS[1].icon} text-white text-[26px]`}></i>
                      </div>
                    </div>
                    <h2 className="text-center text-[22px] sm:text-[26px] font-bold text-(--text-content-default) leading-[30px] sm:leading-[34px] tracking-[-0.3px]">
                      Tell us a bit more
                    </h2>
                    <p className="text-center text-[13px] sm:text-[15px] font-normal text-(--text-content-subtle) leading-[20px] mt-[4px]">
                      A couple more details about them
                    </p>
                  </div>

                  <div className="form-wrapper mt-[32px]">
                    <div className="form-group">
                      <DatePickerInputLabel name="dob" control={control} label="Child's date of birth" />
                    </div>

                    <div className="form-group mt-[24px]">
                      <FormSelectLabel
                        name="gender"
                        control={control}
                        label="Select gender"
                        options={genderOptions}
                        variant="outlined"
                      />
                    </div>

                    <div className="form-group mt-[24px]">
                      <InputLabel
                        name="nin"
                        control={control}
                        label="Child's NIN"
                        variant="outlined"
                      />
                    </div>

                    <div className="form-group mt-[24px]">
                      <InputLabel
                        name="mothersMaidenName"
                        control={control}
                        label="Child's mother's maiden name"
                        variant="outlined"
                      />
                    </div>

                    <div>
                      <Button
                        type="button"
                        onClick={handleNext}
                        variant="primary"
                        disabled={false}
                        isLoading={false}
                        className="rounded-[99px] h-[56px] mt-[24px] text-[16px] font-semibold shadow-[0_8px_20px_rgba(0,88,94,0.18)] transition-transform active:scale-[0.98]"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col items-center mt-[28px]">
                    <div
                      className="p-[10px] rounded-[22px] mb-[16px] shadow-sm"
                      style={{ backgroundColor: STEPS[2].badgeBg }}
                    >
                      <div
                        className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border-4 border-white/40"
                        style={{ background: `linear-gradient(135deg, ${STEPS[2].from}, ${STEPS[2].to})` }}
                      >
                        <i className={`${STEPS[2].icon} text-white text-[26px]`}></i>
                      </div>
                    </div>
                    <h2 className="text-center text-[22px] sm:text-[26px] font-bold text-(--text-content-default) leading-[30px] sm:leading-[34px] tracking-[-0.3px]">
                      Upload documents
                    </h2>
                    <p className="text-center text-[13px] sm:text-[15px] font-normal text-(--text-content-subtle) leading-[20px] mt-[4px]">
                      A couple of documents to verify their identity
                    </p>
                  </div>

                  <div className="mt-[28px] flex flex-col gap-[12px]">
                    <input
                      ref={birthCertificateInputRef}
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      hidden
                      onChange={(e) => handleFileSelect(e.target.files?.[0], setBirthCertificate)}
                    />
                    <div
                      onClick={() => birthCertificateInputRef.current?.click()}
                      className={`group flex items-center gap-[16px] cursor-pointer rounded-[16px] border-[1.5px] px-[20px] py-[18px] transition-all duration-200 ${
                        birthCertificate
                          ? "border-[#00868D]/30 bg-[#F0FAFB]"
                          : "border-dashed border-[#E0E0E0] hover:border-[#00868D]/40 hover:bg-[#FAFDFD]"
                      }`}
                    >
                      <div className="relative shrink-0">
                        {birthCertificatePreview ? (
                          <img
                            src={birthCertificatePreview}
                            alt="Birth certificate preview"
                            className="h-[44px] w-[44px] rounded-[12px] object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-[44px] w-[44px] items-center justify-center rounded-[12px] transition-colors ${
                              birthCertificate ? "bg-[#00868D]" : "bg-[#F4F4F4] group-hover:bg-[#E5F5F6]"
                            }`}
                          >
                            <i
                              className={`${birthCertificate ? "ri-file-pdf-2-fill text-white" : "ri-file-text-line text-[#5A5A5A]"} text-[20px]`}
                            ></i>
                          </div>
                        )}
                        {birthCertificate && (
                          <span className="absolute -bottom-[3px] -right-[3px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#00868D] ring-2 ring-white">
                            <i className="ri-check-line text-[10px] text-white"></i>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-(--text-content-default) text-[15px] font-bold leading-[20px]">
                          <span>Child's birth certificate</span>
                        </div>
                        <div className="mt-[3px] text-(--text-content-subtle) text-[13px] font-normal leading-[18px] truncate">
                          <span>
                            {birthCertificate
                              ? birthCertificate.name
                              : "Only PNG, JPG or PDF less than 5MB"}
                          </span>
                        </div>
                      </div>
                      <i className="ri-arrow-right-s-line text-[20px] text-[#BFBFBF] shrink-0"></i>
                    </div>

                    <input
                      ref={passportPhotoInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      hidden
                      onChange={(e) => handleFileSelect(e.target.files?.[0], setPassportPhoto)}
                    />
                    <div
                      onClick={() => passportPhotoInputRef.current?.click()}
                      className={`group flex items-center gap-[16px] cursor-pointer rounded-[16px] border-[1.5px] px-[20px] py-[18px] transition-all duration-200 ${
                        passportPhoto
                          ? "border-[#00868D]/30 bg-[#F0FAFB]"
                          : "border-dashed border-[#E0E0E0] hover:border-[#00868D]/40 hover:bg-[#FAFDFD]"
                      }`}
                    >
                      <div className="relative shrink-0">
                        {passportPhotoPreview ? (
                          <img
                            src={passportPhotoPreview}
                            alt="Passport photograph preview"
                            className="h-[44px] w-[44px] rounded-[12px] object-cover"
                          />
                        ) : (
                          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-[#F4F4F4] transition-colors group-hover:bg-[#E5F5F6]">
                            <i className="ri-user-line text-[#5A5A5A] text-[20px]"></i>
                          </div>
                        )}
                        {passportPhoto && (
                          <span className="absolute -bottom-[3px] -right-[3px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#00868D] ring-2 ring-white">
                            <i className="ri-check-line text-[10px] text-white"></i>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-(--text-content-default) text-[15px] font-bold leading-[20px]">
                          <span>Passport photograph</span>
                        </div>
                        <div className="mt-[3px] text-(--text-content-subtle) text-[13px] font-normal leading-[18px] truncate">
                          <span>
                            {passportPhoto
                              ? passportPhoto.name
                              : "Clear photo against a white background"}
                          </span>
                        </div>
                      </div>
                      <i className="ri-arrow-right-s-line text-[20px] text-[#BFBFBF] shrink-0"></i>
                    </div>
                  </div>

                  <div className="mt-[24px] flex justify-center rounded-[14px] bg-[#FAFAFA] border border-[#F4F4F4] px-[16px] py-[14px]">
                    <Checkbox
                      type="checkbox"
                      label={termsLink}
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      className="rounded-[99px] h-[56px] mt-[20px] text-[16px] font-semibold shadow-[0_8px_20px_rgba(0,88,94,0.18)] transition-transform active:scale-[0.98]"
                    >
                      Create account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </Dialog>
    </>
  );
};

export default CreateMinorAccount;
