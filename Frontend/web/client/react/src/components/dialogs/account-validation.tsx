import { yupResolver } from "@hookform/resolvers/yup";
import { Dialog, Divider, Stepper, type DialogProps } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Button from "../atoms/buttons";
import InputLabel from "../atoms/input-with-label";
import GlowInvestNaijaIcon from "../../assets/icons/glow-investnaija-logo.svg";
import mailLogo from "../../assets/icons/v-email.svg";
import smsLogo from "../../assets/icons/v-sms.svg";
import { useAuth } from "../../contexts/authContext";
import OtpInput from "react-otp-input";

interface AccountValidationProps {
  setAccountValidationDialog: (open: boolean) => void;
  openAccountValidationDialog: boolean;
}

interface AccountValidationDTO {
  email: string;
}

const accountValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .matches(/\S+@\S+\.\S+/, "Please verify your email address and try again"),
});

const AccountValidation = (props: AccountValidationProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [otp, setOtp] = useState("");

  const { state } = useAuth();

  const resendCode = () => {
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      props.setAccountValidationDialog(false);
    }
  };

  // initialize the form with react hook form and yup resolver for validation
  const { control, handleSubmit } = useForm<AccountValidationDTO>({
    resolver: yupResolver(accountValidationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  // Handle form submission
  const onSubmit = async (data: AccountValidationDTO) => {
    handleNext();
    // await submitLogin(data);
  };

  return (
    <>
      <Dialog
        open={props.openAccountValidationDialog}
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
              //   padding: "34px 24px",
              width: "40%",
              //   minWidth: "90%",

              margin: "0",
            },
          },
        }}
      >
        <Stepper activeStep={activeStep}>
          {/* {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))} */}
        </Stepper>

        {activeStep === 0 && (
          <div className="mb-[47px]">
            <div>
              <div className="flex justify-start px-[24px] py-[24px]">
                <span
                  className="text-[#0F0F0F] cursor-pointer"
                  onClick={() => props.setAccountValidationDialog(false)}
                >
                  <i className="ri-close-fill text-[24px] leading-[28px]"></i>
                </span>
              </div>
            </div>
            <Divider className="bg-[#F4F4F4]" />

            <div className="title-wrapper mt-[48px]">
              <div className="login-logo-wrapper flex justify-center">
                <img
                  src={GlowInvestNaijaIcon}
                  height="100"
                  width="100"
                  className="text-black"
                  alt="InvestNaija Logo"
                />
              </div>

              <div className="text-center mt-[16px]">
                <div>
                  <h3 className="text-(--text-content-default) text-[28px] font-semibold leading-[40px] tracking-[-0.3px]">
                    Welcome Samuel
                  </h3>
                  <h6 className="text-[#5A5A5A] text-[14px] font-normal leading-[20px] tracking-[0.1px]">
                    Let’s verify and confirm your InvestNaija account.
                  </h6>
                </div>
              </div>
            </div>

            <div className="form-wrapper mt-[60px] px-[24px]">
              <form className="" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <InputLabel
                    name="email"
                    control={control}
                    label="Email"
                    variant="outlined"
                  />
                </div>

                <div>
                  <Button
                    variant="primary"
                    disabled={false}
                    isLoading={false}
                    className="rounded-[99px] h-[56px] mt-[119px] text-[16px] font-semibold leading-[24px] tracking-[0.2px]"
                    onClick={handleNext}
                  >
                    Confirm email
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="mb-[47px]">
            <div>
              <div className="flex justify-start px-[24px] py-[24px]">
                <span
                  className="text-[#0F0F0F] cursor-pointer"
                  onClick={handleBack}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"
                      fill="#0F0F0F"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <Divider className="bg-[#F4F4F4]" />

            <div className="title-wrapper mt-[48px]">
              <div className="text-center mt-[16px]">
                <div>
                  <h3 className="text-(--text-content-default) text-[28px] font-semibold leading-[40px] tracking-[-0.3px]">
                    Verify my account
                  </h3>
                  <h6 className="text-[#5A5A5A] text-[14px] font-normal leading-[20px] tracking-[0.1px]">
                    Almost there! Choose how you’d like to verify your account.
                  </h6>
                </div>
              </div>
            </div>

            <div className="mt-[48px] px-[24px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#fafafa] py-[48px] px-[16px] border border-[#DCDCDC] rounded-2xl cursor-pointer">
                  <div className="email-logo flex justify-center">
                    <img
                      src={mailLogo}
                      height="48"
                      width="48"
                      className="text-black"
                      alt="MAIL"
                    />
                  </div>
                  <div className="mt-[12px]">
                    <h4 className="text-center text-[16px] font-bold leading-[24px] text-(--text-content-default)">
                      Email
                    </h4>
                  </div>
                  <div className="flex justify-center items-center text-[#44A185]">
                    <span>
                      <i className="ri-checkbox-circle-fill text-[16px]"></i>
                    </span>
                    <span className="ml-1 text-[14px] leading-20px tracking-[0.1px] font-normal">
                      Available
                    </span>
                  </div>
                </div>
                <div className="bg-[#fafafa] py-[48px] px-[16px] border border-[#DCDCDC] rounded-2xl cursor-pointer">
                  <div className="email-logo flex justify-center">
                    <img
                      src={smsLogo}
                      height="48"
                      width="48"
                      className="text-black"
                      alt="SMS"
                    />
                  </div>
                  <div className="mt-[12px]">
                    <h4 className="text-center text-[16px] font-bold leading-[24px] text-(--text-content-default)">
                      SMS
                    </h4>
                  </div>
                  <div className="flex justify-center items-center text-[#44A185]">
                    <span>
                      <i className="ri-checkbox-circle-fill text-[16px]"></i>
                    </span>
                    <span className="ml-1 text-[14px] leading-20px tracking-[0.1px] font-normal">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-[24px]">
              <Button
                variant="primary"
                disabled={false}
                isLoading={false}
                className="rounded-[99px] h-[56px] mt-[119px] text-[16px] font-semibold leading-[24px] tracking-[0.2px]"
                onClick={handleNext}
              >
                Send OTP
              </Button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="mb-[47px]">
            <div>
              <div className="flex justify-start px-[24px] py-[24px]">
                <span
                  className="text-[#0F0F0F] cursor-pointer"
                  onClick={() => props.setAccountValidationDialog(false)}
                >
                  <i className="ri-close-fill text-[24px] leading-[28px]"></i>
                </span>
              </div>
            </div>
            <Divider className="bg-[#F4F4F4]" />

            <div className="verify-account-wrapper flex justify-center">
              <div>
                <div className="verify-account-header mt-[56px]">
                  <h2 className="text-center">Verify my account</h2>
                  <span className="web-body-m justify-center flex text-center">
                    We sent a 6 digit code to your mail
                  </span>
                  <p className="text-center web-body-m text-[#0f0f0f]">
                    fra**********@mail.com
                  </p>
                </div>
                <div className="verify-account-body mt-[40px] justify-center flex ">
                  <OtpInput
                    inputStyle={{
                      width: "56px",
                      border: "2px solid #E5E5E5",
                      height: "56px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      background: "#F5F5F5",
                    }}
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span> &nbsp;&nbsp;&nbsp;&nbsp;</span>}
                    placeholder="••••••"
                    renderInput={(props) => <input {...props} />}
                  />
                </div>
                <div className="codeExpiry flex justify-center mt-2">
                  <p className="text-(--text-content-default) text-[14px] font-medium leading-[20px] tracking-[0.2px]">
                    Code expires in{" "}
                    <span className="text-[#0E47D8]">00.59</span>
                  </p>
                </div>
                <div className="flex justify-center text-center mt-[80px]">
                  <Button
                    variant="primary"
                    disabled={state.isLoading}
                    isLoading={state.isLoading}
                    className="rounded-[99px] h-[56px] mt-[40px]"
          
                  >
                    Verify email
                  </Button>
                </div>

                   <div className="flex justify-center text-center web-body-m text-[#5A5A5A] leading-[24px] tracking-[0.2px] font-semibold cursor-pointer mt-[24px] py-[16px]">
                  <a onClick={() => resendCode()}>Resend OTP</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default AccountValidation;
