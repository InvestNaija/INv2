import { FormControlLabel } from "@mui/material";
import { useState } from "react";
import { IOSSwitch } from "../../../../hooks/iosswitch";

const Notifications = () => {
  const [isCheckedNotification, setIsCheckedNotification] = useState({
    inApp: true,
    pushNotification: false,
    alert: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckedNotification({
      ...isCheckedNotification,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <>
      <div className="notifications-wrapper w-full mt-[40px]">
        <div className="sm:w-[100%] xs:w-[100%] w-[100%] md:w-[552px] lg:w-[552px] xl:w-[552px]">
          <div>
            <div className="notifications-content-wrapper border border-[#F4F4F4] rounded-[16px] p-[16px]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-(--text-content-default) text-[18px] font-semibold leading-[26px]">
                    <span>In-app notifications</span>
                  </div>
                  <div className="mt-[8px] text-(--text-content-subtle) text-[16px] font-normal leading-[24px]">
                    <span>
                      Allow InvestNaija to send notifications while using the
                      app.
                    </span>
                  </div>
                </div>

                <div>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={isCheckedNotification.inApp}
                        onChange={handleChange}
                        name="inApp"
                      />
                    }
                    label=""
                  />
                </div>
              </div>
            </div>

            <div className="mt-[24px] notifications-content-wrapper border border-[#F4F4F4] rounded-[16px] p-[16px]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-(--text-content-default) text-[18px] font-semibold leading-[26px]">
                    <span>Push notifications</span>
                  </div>
                  <div className="mt-[8px] text-(--text-content-subtle) text-[16px] font-normal leading-[24px]">
                    <span>
                      Allow InvestNaija to send notifications on your browser.
                    </span>
                  </div>
                </div>

                <div>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={isCheckedNotification.pushNotification}
                        onChange={handleChange}
                        name="pushNotification"
                      />
                    }
                    label=""
                  />
                </div>
              </div>
            </div>

            <div className="mt-[24px] notifications-content-wrapper border border-[#F4F4F4] rounded-[16px] p-[16px]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-(--text-content-default) text-[18px] font-semibold leading-[26px]">
                    <span>Alerts</span>
                  </div>
                  <div className="mt-[8px] text-(--text-content-subtle) text-[16px] font-normal leading-[24px]">
                    <span>
                      Allow InvestNaija to send price alerts and updates on
                      stocks, funds or offers even when logged off.
                    </span>
                  </div>
                </div>

                <div>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={isCheckedNotification.alert}
                        onChange={handleChange}
                        name="alert"
                      />
                    }
                    label=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
