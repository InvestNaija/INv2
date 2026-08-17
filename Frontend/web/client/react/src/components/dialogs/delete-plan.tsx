import { Dialog, type DialogProps } from "@mui/material";
import SaveIcon from "../../assets/icons/edu-icon.svg";
import Button from "../atoms/buttons";

// 1. Define strict types for the possible outcomes
export type DialogFeedbackResult = true | false;



interface DeletePlanProps {
  setDeletePlanDialog: (open: boolean) => void;
  openDeletePlanDialog: boolean;
  onCloseDeletePlanDialog: (result: DialogFeedbackResult | null) => void;
}

const DeletePlan = (props: DeletePlanProps) => {
  const handleDialogClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      props.setDeletePlanDialog(false);
    }
  };

   const handleDeleteComplete = (): void => {
    // if (localResult) {
        // Send the type-safe result back to parent
       props.onCloseDeletePlanDialog(null);  // Reset state
    // }
  };


  return (
    <>
      <Dialog
        open={props.openDeletePlanDialog}
        onClose={handleDialogClose}
        // @ts-ignore: MUI DialogProps typing issue
        TransitionProps={{
          onExited: handleDeleteComplete
        }}
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
              padding: "34px 24px",
              //   width: "40%",
              //   minWidth: "90%",
            },
          },
        }}
      >
        <div>
          <div className="md:w-md xl:w-md lg:w-md xs:w-sm sm:w-sm w-sm">
            <div className="flex justify-start">
              <span
                className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px]"
                onClick={() => props.setDeletePlanDialog(false)}
              >
                <i className="ri-close-fill text-[24px] leading-[28px]"></i>
              </span>
            </div>
          </div>
          <div className="delete-plan-wrapper mt-[8px] ">
            <div>
              <div className="flex justify-center">
                <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-white-500">
                  <img src={SaveIcon} height="64" width="64" alt="Asset Icon" />
                </div>
              </div>

              <div className="text-center mt-[24px] text-[20px] text-(--text-content-default) font-semibold leading-[28px]">
                <span>Delete this plan</span>
              </div>
               <div className="text-center text-[16px] text-(--text-content-default) font-normal leading-[24px]">
                <span>Are you sure you want to close this plan?</span>
              </div>

              <div className="mt-[44px]">

                  <Button
                    variant="danger"
                    disabled={false}
                    isLoading={false}
                    className="rounded-[99px] h-[56px] xs:w-sm sm:w-sm w-sm lg:w-md xl:w-md "
                    onClick={() =>props.setDeletePlanDialog(false)}
                  >
                   Delete plan anyway
                  </Button>
                  <div className="mt-[36px] text-center">
                  <a onClick={() =>props.setDeletePlanDialog(false)} className=" cursor-pointer py-[16px] text-center text-[16px] text-(--text-content-default) font-semibold leading-[24px] tracking-[0.2px]">
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

export default DeletePlan;
