import { Dialog, type DialogProps } from "@mui/material";
import Button from "../atoms/buttons";

interface SessionExpiredProps {
  openSessionExpiredDialog: boolean;
  onDismiss: () => void;
}

const SessionExpired = (props: SessionExpiredProps) => {
  const handleDialogClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      props.onDismiss();
    }
  };

  return (
    <>
      <Dialog
        open={props.openSessionExpiredDialog}
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
              borderRadius: { xs: "20px", sm: "24px" },
              width: "420px",
              maxWidth: "calc(100% - 24px)",
              maxHeight: "calc(100dvh - 24px)",
              margin: 0,
              padding: { xs: "28px 20px", sm: "34px 24px" },
              boxSizing: "border-box",
              overflowY: "auto",
            },
          },
        }}
      >
        <div className="session-expired-wrapper mt-[8px]">
          <div className="flex justify-center">
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-[#FFECDF]">
              <i className="ri-alarm-warning-line text-[32px] text-[#E77731]"></i>
            </div>
          </div>

          <div className="text-center mt-[24px] text-[18px] sm:text-[20px] text-(--text-content-default) font-semibold leading-[26px] sm:leading-[28px]">
            <span>Session expired</span>
          </div>
          <div className="text-center mt-[8px] text-[14px] sm:text-[16px] text-(--text-content-default) font-normal leading-[20px] sm:leading-[24px]">
            <span>
              You've been inactive for a while, so we logged you out for
              your security. Please log in again to continue.
            </span>
          </div>

          <div className="mt-[32px] sm:mt-[44px]">
            <Button
              variant="primary"
              disabled={false}
              isLoading={false}
              className="rounded-[99px] h-[52px] sm:h-[56px] transition-transform active:scale-[0.98]"
              onClick={props.onDismiss}
            >
              Log in again
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default SessionExpired;
