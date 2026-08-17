import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { bvnSchema } from "./additional-kyc-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import InputLabel from "../../atoms/input-with-label";
import Button from "../../atoms/buttons";
import { useUser } from "../../../contexts/userContext";
import { toast } from "react-toastify";
import OtpVerification from "../otp-verification";

export interface BVNDTO {
  bvn: string;
}

interface BVNProps {
  initialData: Partial<BVNDTO>;
  onNext: (data: BVNDTO) => void;
}


const BVN = ({ initialData, onNext }: BVNProps) => {
  const { initiateBvn, validateUserBvn, requestBvnOtp, confirmBvnOtp } = useUser();
  const [bvnImplementation, setBvnImplementation] = useState<any>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [activeStep, setActiveStep] = useState<"INPUT_BVN" | "SELECT_OTP_METHOD">("INPUT_BVN");
  const [bvnInfo, setBvnInfo] = useState<string>("");
  const [otpOptions, setOtpOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [currentBvnData, setCurrentBvnData] = useState<BVNDTO | null>(null);

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(bvnSchema),
    defaultValues: initialData as BVNDTO
  });

  const onSubmitBvn = async (data: BVNDTO) => {
    setIsValidating(true);
    try {
      const response = await validateUserBvn({ bvn: data.bvn, vendor: "verifyme" });
      const options = response?.data?.options || response?.options || [];
      const info = response?.data?.bvn_info || response?.bvn_info || "";

      setOtpOptions(options);
      setBvnInfo(info);
      setCurrentBvnData(data);

      if (options.length > 0) {
        setActiveStep("SELECT_OTP_METHOD");
      } else {
        onNext(data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || "Failed to validate BVN.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerateOtp = async () => {
    if (!selectedOption) {
      toast.error("Please select an OTP delivery method.");
      return;
    }
    setIsGeneratingOtp(true);
    try {
      await requestBvnOtp({
        option: selectedOption,
        bvn_info: bvnInfo,
        vendor: "verifyme"
      });
      setOpenOtpDialog(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || "Failed to generate OTP.");
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsVerifyingOtp(true);
    try {
      await confirmBvnOtp({
        otp,
        bvn_info: bvnInfo,
        vendor: "verifyme"
      });
      toast.success("BVN verified successfully!");
      setOpenOtpDialog(false);
      if (currentBvnData) {
        onNext(currentBvnData);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || "Failed to verify OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    const fetchBvnImplementation = async () => {
      try {
        const data = await initiateBvn();
        // console.log("BVN Implementation Data:", data);
        setBvnImplementation(data);
      } catch (error) {
        console.error("Failed to initialize BVN:", error);
      }
    };
    fetchBvnImplementation();
  }, []);

  const isVerifyMe = bvnImplementation?.vendor === 'verifyme' || bvnImplementation?.data?.vendor === 'verifyme' || bvnImplementation?.data?.vendorName === 'verifyme';

  return (
    <>
      {!bvnImplementation ? (
        <div className="mt-[40px] flex justify-center">
          <i className="ri-loader-4-line animate-spin text-[32px] text-[#00868D]"></i>
        </div>
      ) : isVerifyMe ? (
        activeStep === "INPUT_BVN" ? (
          <div className="form-wrapper mt-[24px] px-[24px]">
            <form className="" onSubmit={handleSubmit(onSubmitBvn)}>
              <div className="form-group">
                <InputLabel
                  name="bvn"
                  control={control}
                  label="Enter your BVN"
                  variant="outlined"
                />
              </div>

              <div className="text-center mt-[24px] text-[12px] text-[#BFBFBF] font-medium leading-[16px] tracking-[0.2px]">
                <span>Your BVN only grants us access to verify your Name, Date of birth, Phone number and email. Dial *565*0# to retrieve yours</span>
              </div>

              <div>
                <Button
                  variant="primary"
                  disabled={isValidating}
                  isLoading={isValidating}
                  className="rounded-[99px] h-[56px] mt-[24px] text-[16px] font-semibold leading-[24px] tracking-[0.2px] transition-transform active:scale-[0.98]"
                  type="submit"
                >
                  Verify BVN
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="form-wrapper mt-[24px] px-[24px]">
            <div className="mb-[24px]">
              <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-[8px]">Select OTP Method</h3>
              <p className="text-[13px] text-[#5A5A5A]">Where should we send your verification code?</p>
            </div>

            <div className="flex flex-col gap-[16px]">
              {otpOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  className={`border rounded-[12px] p-[16px] cursor-pointer transition-colors ${selectedOption === opt ? 'border-[#00868D] bg-[#00868D]/5' : 'border-[#EAEAEA] hover:border-[#CCCCCC]'}`}
                >
                  <div className="flex items-center gap-[12px]">
                    <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${selectedOption === opt ? 'border-[#00868D]' : 'border-[#CCCCCC]'}`}>
                      {selectedOption === opt && <div className="w-[10px] h-[10px] rounded-full bg-[#00868D]"></div>}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#1A1A1A] capitalize">{opt.type}</p>
                      <p className="text-[12px] text-[#8C8C8C] mt-[2px]">{opt.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              disabled={isGeneratingOtp || !selectedOption}
              isLoading={isGeneratingOtp}
              className="w-full rounded-[99px] h-[56px] mt-[32px] text-[16px] font-semibold leading-[24px]"
              onClick={handleGenerateOtp}
            >
              Send OTP
            </Button>

            <OtpVerification
              openDialog={openOtpDialog}
              setDialog={setOpenOtpDialog}
              title="Verify BVN"
              description={`We sent a 6 digit code to your ${selectedOption?.type || 'phone'}`}
              isSubmitting={isVerifyingOtp}
              isResending={isGeneratingOtp}
              onSubmit={handleVerifyOtp}
              onResend={handleGenerateOtp}
              email={selectedOption?.value}
            />
          </div>
        )
      ) : (
        <div className="mt-[24px] px-[24px] text-center text-[14px] text-[#5A5A5A]">
          Alternative BVN provider loading...
        </div>
      )}
    </>
  )
}

export default BVN;