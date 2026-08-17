import { useForm, Controller } from "react-hook-form";
import { kinSchema } from "./additional-kyc-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import InputLabel from "../../atoms/input-with-label";
import Button from "../../atoms/buttons";
import FormSelectLabel from "../../atoms/select-with-label";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";
import SearchableCountrySelect from "../../molecules/searchable-country-select";
import { useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "../../../contexts/userContext";



export interface KINDTO {
    nextOfKinName: string;
    nextOfKinPhone: string;
    nextOfKinRelationship: string;
    nextOfKinAddress: string;
}
interface KINDTOProps {
  initialData: Partial<KINDTO>;
  onNext: (data: KINDTO) => void;
}

const RELATIONSHIPS_OPTIONS = [
  { value: "husband", label: "Husband" },
  { value: "wife", label: "Wife" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "parent", label: "Parent" },
  { value: "others", label: "Others" },
];


const KIN = ({ initialData, onNext }: KINDTOProps) => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(kinSchema),
    defaultValues: initialData as KINDTO
  });

  const { submitUpdateNextOfKin } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: KINDTO) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.nextOfKinName || '',
        relationship: data.nextOfKinRelationship || '',
        address: data.nextOfKinAddress || '',
        phoneNumber: data.nextOfKinPhone || '',
        email: '' // Email is not collected in this form currently
      };

      await submitUpdateNextOfKin(payload);
      toast.success("Next of kin details saved successfully!");
      onNext(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save next of kin details.");
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
        <>
         <div className="form-wrapper mt-[24px] px-[24px]">
              <form className="" onSubmit={handleSubmit(onSubmit)}>

                  <div className="form-group">
                  <InputLabel
                    name="nextOfKinName"
                    control={control}
                    label="Enter next of kin's full name"
                    variant="outlined"
                  />
                </div>

                  <div className="form-group mt-[24px]">
                  <Controller
                    name="nextOfKinPhone"
                    control={control}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <div className={`relative border rounded-[10px] px-[14px] py-[14px] transition-colors ${
                        error ? "border-[#d32f2f] focus-within:border-[#d32f2f]" : "border-[#DCDCDC] focus-within:border-[#9B9B9B]"
                      }`}>
                        <label className={`absolute -top-[9px] left-[10px] bg-white px-1 text-[12px] transition-colors ${
                          error ? "text-[#d32f2f]" : "text-[#9B9B9B]"
                        }`}>
                          Enter next of kin's phone number
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
                            id="nextOfKinPhone"
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
                </div>


                <div className="form-group mt-[24px]">
                  <FormSelectLabel
                    name="nextOfKinRelationship"
                    control={control}
                    label="Select next of kin's relationship"
                    options={RELATIONSHIPS_OPTIONS}
                    variant="outlined"
                  />
                </div>

                 <div className="form-group mt-[24px]">
                  <InputLabel
                    name="nextOfKinAddress"
                    control={control}
                    label="Enter next of kin's address"
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
                    Submit
                  </Button>
                </div>
              </form>
              <style>{`
        .light-phone-input .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: #222;
          font-size: 16px;
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
          border-radius: 4px;
        }
      `}</style>
            </div>
        
        </>
    )
}

export default KIN;