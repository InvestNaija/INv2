import { Dialog, type DialogProps } from "@mui/material";
import Button from "../atoms/buttons";

interface LogoutConfirmationProps {
  openLogoutDialog: boolean;
  setLogoutDialog: (open: boolean) => void;
  onConfirmLogout: () => void;
  isLoading?: boolean;
}

const LogoutConfirmation = (props: LogoutConfirmationProps) => {
  const handleDialogClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      props.setLogoutDialog(false);
    }
  };

  return (
    <>
      <Dialog
        open={props.openLogoutDialog}
        onClose={handleDialogClose}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(0px)",
              opacity: "0.5",
            },
          },
          paper: {
            sx: {
              backgroundColor: "#fff",
              borderRadius: "24px",
              padding: "34px 24px",
            },
          },
        }}
      >
        <div>
          <div className="md:w-md xl:w-md lg:w-md xs:w-sm sm:w-sm w-sm">
            <div className="flex justify-start">
              <span
                className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px]"
                onClick={() => props.setLogoutDialog(false)}
              >
                <i className="ri-close-fill text-[24px] leading-[28px]"></i>
              </span>
            </div>
          </div>
          <div className="logout-confirmation-wrapper mt-[8px]">
            <div>
              <div className="flex justify-center">
                <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-[#FFECDF]">
                  <i className="ri-logout-box-r-line text-[32px] text-[#CC1A30]"></i>
                </div>
              </div>

              <div className="text-center mt-[24px] text-[20px] text-(--text-content-default) font-semibold leading-[28px]">
                <span>Log out</span>
              </div>
              <div className="text-center text-[16px] text-(--text-content-default) font-normal leading-[24px]">
                <span>Are you sure you want to log out?</span>
              </div>

              <div className="mt-[44px]">
                <Button
                  variant="danger"
                  disabled={props.isLoading}
                  isLoading={props.isLoading}
                  className="rounded-[99px] h-[56px] xs:w-sm sm:w-sm w-sm lg:w-md xl:w-md"
                  onClick={props.onConfirmLogout}
                >
                  Log out
                </Button>
                <div className="mt-[36px] text-center">
                  <a
                    onClick={() => props.setLogoutDialog(false)}
                    className="cursor-pointer py-[16px] text-center text-[16px] text-(--text-content-default) font-semibold leading-[24px] tracking-[0.2px]"
                  >
                    Cancel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default LogoutConfirmation;
