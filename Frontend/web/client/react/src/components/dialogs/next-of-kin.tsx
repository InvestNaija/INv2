import { Dialog, type DialogProps } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../atoms/buttons";
import InputLabel from "../atoms/input-with-label";
import FormSelectLabel from "../atoms/select-with-label";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import SearchableCountrySelect from "../molecules/searchable-country-select";
import { useUser } from "../../contexts/userContext";
import { useEffect } from "react";

interface NextOfKinProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
}

interface NextOfKinDTO {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

const schema = yup.object().shape({
  name: yup.string().required("Full name is required"),
  relationship: yup.string().required("Relationship is required"),
  phone: yup.string().required("Phone number is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  address: yup.string().required("Address is required"),
});

const NextOfKinDialog = (props: NextOfKinProps) => {
  const { currentUser, submitUpdateNextOfKin, refetchUser } = useUser();
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NextOfKinDTO>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const relationshipOptions = [
    { label: "Father", value: "Father" },
    { label: "Mother", value: "Mother" },
    { label: "Spouse", value: "Spouse" },
    { label: "Brother", value: "Brother" },
    { label: "Sister", value: "Sister" },
    { label: "Son", value: "Son" },
    { label: "Daughter", value: "Daughter" },
    { label: "Other", value: "Other" },
  ];

  useEffect(() => {
    if (props.openDialog && currentUser) {
      reset({
        name: currentUser.nextOfKinName || "",
        relationship: currentUser.nextOfKinRelationship || "",
        phone: currentUser.nextOfKinPhone || "",
        email: currentUser.nextOfKinEmail || "",
        address: currentUser.nextOfKinAddress || "",
      });
    }
  }, [props.openDialog, currentUser, reset]);

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      props.setDialog(false);
    }
  };

  const onSubmit = async (data: NextOfKinDTO) => {
    try {
      await submitUpdateNextOfKin({
        name: data.name,
        relationship: data.relationship,
        phoneNumber: data.phone,
        email: data.email,
        address: data.address,
      });
      await refetchUser();
      toast.success("Next of kin updated successfully");
      props.setDialog(false);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
           error.response?.data?.error?.message ??
           error.message)
        : "Failed to update next of kin";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog
      open={props.openDialog}
      onClose={handleDialogClose}
      slotProps={{
        transition: { onEnter: () => reset() },
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(15, 15, 15, 0.45)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "var(--surface-default)",
            borderRadius: { xs: "20px", sm: "24px" },
            width: "520px",
            maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
            maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
            margin: { xs: "12px", sm: "32px" },
            overflowY: "auto",
            padding: { xs: "24px 16px", sm: "34px 24px" },
          },
        },
      }}
    >
      <div className="relative">
        <div className="absolute top-0 right-0">
          <button
            type="button"
            onClick={() => props.setDialog(false)}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-[20px] text-[#222]"></i>
          </button>
        </div>

        <div className="mt-[8px] sm:mt-[12px] pr-[48px]">
          <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111111] leading-[30px] sm:leading-[34px] tracking-tight">
            Next of Kin
          </h2>
          <p className="mt-[6px] text-[#888] text-[13px] sm:text-[14px] leading-[20px] font-medium">
            Update your emergency contact information.
          </p>
        </div>

        <form className="mt-[32px]" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-[20px]">
            <InputLabel
              name="name"
              label="Full Name"
              control={control}
              placeholder="Enter full name"
            />

            <FormSelectLabel
              name="relationship"
              label="Relationship"
              control={control}
              options={relationshipOptions}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <div className={`relative flex h-[56px] items-center rounded-[12px] border px-4 transition-all ${
                  error ? "border-[#d32f2f]" : "border-[#DCDCDC] focus-within:border-[#00868D]"
                }`}>
                  <label className={`absolute -top-[9px] left-[10px] bg-white px-1 text-[12px] transition-colors ${
                    error ? "text-[#d32f2f]" : "text-[#9B9B9B]"
                  }`}>
                    Phone Number
                  </label>
                  <div className="light-phone-input flex items-center w-full">
                    <PhoneInputWithCountrySelect
                      value={value}
                      onChange={onChange}
                      defaultCountry="NG"
                      international={true}
                      limitMaxLength={true}
                      countryCallingCodeEditable={false}
                      countrySelectComponent={(props) => (
                        <SearchableCountrySelect {...props} theme="light" />
                      )}
                      id="phone"
                      placeholder="e.g. +234 801 234 5678"
                      className="w-full"
                    />
                  </div>
                  {error && (
                    <span className="absolute -bottom-[20px] left-[14px] text-[12px] text-[#d32f2f]">
                      {error.message}
                    </span>
                  )}
                </div>
              )}
            />

            <InputLabel
              name="email"
              label="Email Address"
              control={control}
              placeholder="Enter email address"
            />

            <InputLabel
              name="address"
              label="Home Address"
              control={control}
              placeholder="Enter home address"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="rounded-[99px] h-[56px] mt-[40px] w-full text-[16px] font-semibold bg-[#00585E] hover:bg-[#004A4F] text-white transition-transform active:scale-[0.98] shadow-none"
          >
            Save changes
          </Button>
        </form>
      </div>

      <style>{`
        .light-phone-input .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: #222;
          font-size: 15px;
          padding: 0;
          width: 100%;
        }
        .light-phone-input .PhoneInputInput::placeholder {
          color: #9B9B9B;
        }
        .light-phone-input .PhoneInputCountry {
          margin-right: 12px;
          padding-right: 12px;
          border-right: 1px solid #EBEBEB;
        }
        .light-phone-input .PhoneInputCountryIcon {
          width: 28px;
          height: 20px;
          box-shadow: none;
          border-radius: 4px;
          overflow: hidden;
        }
        .light-phone-input .PhoneInputCountryIconImg {
          object-fit: cover;
        }
      `}</style>
    </Dialog>
  );
};

export default NextOfKinDialog;
