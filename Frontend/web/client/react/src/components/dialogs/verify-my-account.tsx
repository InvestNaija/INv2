import Dialog from "@mui/material/Dialog";
import mailLogo from "../../assets/icons/v-email.svg";
import smsLogo from "../../assets/icons/v-sms.svg";
import { useNavigate } from "react-router-dom";

interface VerifyAccountProps {
  setVerifyAccountDialog: (open: boolean) => void;
  openVerifyAccountDialog: boolean;
}

export default function VerifyAccount(props: VerifyAccountProps) {

  const navigate = useNavigate();
  const handleClose = () => {
    props.setVerifyAccountDialog(false);
  };

  const routeToOtp = () => {
       handleClose();
       navigate("/auth/verify-account");
  }

  return (
    <>
      <Dialog
        open={props.openVerifyAccountDialog}
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
              borderRadius: "24px", // Add rounded corners
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.16)",
              border: "1px solid #F4F4F4",
              padding: "32px 24px",
              width: "532px",
            },
          },
        }}
      >
        <div>
          <div className="flex justify-end">
            <span
              className="text-[#0F0F0F] cursor-pointer"
              onClick={() => handleClose()}
            >
              <i className="ri-close-fill text-[24px] leading-[28px]"></i>
            </span>
          </div>
        </div>

        <div className="mt-[24px]">
          <h2 className="text-center text-[20px] font-semibold text-(--text-content-default) leading-[28px]">
            Verify my account
          </h2>
          <span className="flex justify-center text-center text-[16px] font-normal text-[#9B9B9B] leading-[24px] mt-2">
            Almost there! Choose how you’d like to verify your account.
          </span>
        </div>

        <div className="mt-[24px]">
          <div className="grid grid-cols-2 gap-2">
            <div onClick={() => routeToOtp()} className="bg-[#fafafa] py-[48px] px-[16px] border border-[#DCDCDC] rounded-2xl cursor-pointer">
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
                <h4 className="text-center text-[16px] font-bold leading-[24px] text-(--text-content-default)">Email</h4>
              </div>
              <div className="flex justify-center items-center text-[#44A185]">
                <span><i className="ri-checkbox-circle-fill text-[16px]"></i></span>
                 <span className="ml-1 text-[14px] leading-20px tracking-[0.1px] font-normal">Available</span>
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
                <h4 className="text-center text-[16px] font-bold leading-[24px] text-(--text-content-default)">SMS</h4>
              </div>
              <div className="flex justify-center items-center text-[#E5333E]">
                <span><i className="ri-close-circle-fill text-[16px]"></i></span>
                 <span className="ml-1 text-[14px] leading-20px tracking-[0.1px] font-normal">Available</span>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
