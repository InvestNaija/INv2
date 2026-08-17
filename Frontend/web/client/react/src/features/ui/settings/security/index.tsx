import { FormControlLabel } from "@mui/material";
import { useState } from "react";
import { IOSSwitch } from "../../../../hooks/iosswitch";
import { useUser } from "../../../../contexts/userContext";
import ChangePassword from "../../../../components/dialogs/change-password";

const Security = () => {
  const { currentUser, updateShowBalance, updateTwoFactorAuth } = useUser();
  const showBalance = currentUser?.show_balance ?? true;
  const twoFactorAuth = currentUser?.twoFactorAuth ?? false;
  const [openChangePassword, setOpenChangePassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateShowBalance(!event.target.checked);
  };

  const handleTwoFactorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateTwoFactorAuth(event.target.checked);
  };

  return (
    <>
      <div className="w-full max-w-[720px] mt-[8px]">
        <div className="flex flex-col mb-[28px] gap-[4px]">
          <h2 className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none">
            Security
          </h2>
          <p className="text-[15px] font-medium text-[#5A5A5A] leading-relaxed">
            Manage your account security and preferences.
          </p>
        </div>

        <div className="flex flex-col gap-[16px] w-full">
          {!currentUser?.isMinor && (
            <div
              className="group relative flex items-center justify-between p-[22px] bg-white rounded-[20px] border border-[#EAEAEA] hover:border-[#00868D] hover:shadow-[0_4px_20px_rgba(0,134,141,0.08)] transition-all duration-300 cursor-pointer"
              onClick={() => setOpenChangePassword(true)}
            >
              <div className="flex items-center gap-[20px] relative z-10">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-[#F4F4F4] group-hover:bg-[#F0FAFB] flex items-center justify-center text-[#5A5A5A] group-hover:text-[#00868D] transition-colors duration-300 shrink-0 border border-[#F0F0F0]">
                  <i className="ri-lock-password-fill text-[24px]"></i>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[17px] font-bold text-[#111111] tracking-tight group-hover:text-[#00868D] transition-colors">
                    Password
                  </span>
                  <span className="text-[14.5px] font-medium text-[#5A5A5A]">
                    Change your account password
                  </span>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-[24px] text-[#A0AEC0] group-hover:text-[#00868D] transition-colors duration-300 relative z-10"></i>
            </div>
          )}

          {!currentUser?.isMinor && (
            <div className="group relative flex items-center justify-between p-[22px] bg-white rounded-[20px] border border-[#EAEAEA] transition-all duration-300">
              <div className="flex items-center gap-[20px] relative z-10">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-[#F4F4F4] flex items-center justify-center text-[#5A5A5A] shrink-0 border border-[#F0F0F0]">
                  <i className="ri-shield-keyhole-fill text-[24px]"></i>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[17px] font-bold text-[#111111] tracking-tight">
                    Two-factor authentication
                  </span>
                  <span className="text-[14.5px] font-medium text-[#5A5A5A]">
                    Add an authentication app to secure your account
                  </span>
                </div>
              </div>
              <div className="relative z-10">
                <FormControlLabel
                  control={
                    <IOSSwitch
                      sx={{ m: 1 }}
                      checked={twoFactorAuth}
                      onChange={handleTwoFactorChange}
                      name="twoFactorAuth"
                    />
                  }
                  label=""
                />
              </div>
            </div>
          )}

          <div className="group relative flex items-center justify-between p-[22px] bg-white rounded-[20px] border border-[#EAEAEA] transition-all duration-300">
            <div className="flex items-center gap-[20px] relative z-10">
              <div className="w-[52px] h-[52px] rounded-[14px] bg-[#F4F4F4] flex items-center justify-center text-[#5A5A5A] shrink-0 border border-[#F0F0F0]">
                <i className="ri-eye-off-fill text-[24px]"></i>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[17px] font-bold text-[#111111] tracking-tight">
                  Hide all account balance
                </span>
                <span className="text-[14.5px] font-medium text-[#5A5A5A]">
                  Secure your account by hiding your balances
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <FormControlLabel
                control={
                  <IOSSwitch
                    sx={{ m: 1 }}
                    checked={!showBalance}
                    onChange={handleChange}
                    name="inApp"
                  />
                }
                label=""
              />
            </div>
          </div>
        </div>
      </div>

      <ChangePassword
        openDialog={openChangePassword}
        setDialog={setOpenChangePassword}
      />
    </>
  );
};

export default Security;
