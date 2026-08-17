import { Dialog, type DialogProps } from "@mui/material";
import Button from "../atoms/buttons";
import Comments from "./comments";
import { useState } from "react";

interface WelcomeCommentsProps {
  setWelcomeCommentsDialog: (open: boolean) => void;
  openWelcomeCommentsDialog: boolean;
}

const WelcomeComments = (props: WelcomeCommentsProps) => {
const [openCommentsDialog, setCommentsDialog] = useState(false);
    


  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      props.setWelcomeCommentsDialog(false);
    }
  };

  const Continue = () => {
    props.setWelcomeCommentsDialog(false);
    setCommentsDialog(true);
  };

  return (
    <>
        <Comments
            openCommentsDialog={openCommentsDialog}
            setCommentsDialog={setCommentsDialog}
          ></Comments>
      <Dialog
        open={props.openWelcomeCommentsDialog}
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
              padding: "32px",
              //   width: "40%",
              //   minWidth: "90%",

              //   height: "100vh !important",
              //   maxHeight: "100vh !important",
              //   position: "absolute",
              //   top: "0",
              //   right: "0",
              //   margin: "0",
            },
          },
        }}
      >
        <div>
          <div className="relative w-full max-w-lg flex flex-col">
            <div className="flex justify-end">
              <button
                className="text-[#0F0F0F] cursor-pointer bg-[#FAFAFA] border border-[#F0F0F0] rounded-[999px] px-[7.5px] py-[6px]"
                aria-label="Close modal"
                onClick={() => props.setWelcomeCommentsDialog(false)}
              >
                <i className="ri-close-fill text-[24px] leading-[28px]"></i>
              </button>
            </div>

            <div className="text-center mt-[12px]">
              <h1 className="text-[32px] font-bold text-[#0F0F0F] tracking-[-0.4px] leading-[44px]">
                Welcome to comments
              </h1>
              <p className="text-[16px] text-[#5A5A5A] font-normal leading-[24px]">
                Know our commenting guidelines, to ensure a safe interaction.
              </p>
            </div>

            <div className="my-[32px]">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_3662_17652)">
                      <path
                        d="M13.5 21C17.6421 21 21 17.6421 21 13.5C21 9.35786 17.6421 6 13.5 6C9.35786 6 6 9.35786 6 13.5C6 17.6421 9.35786 21 13.5 21Z"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3 26C5.56875 22.9437 9.195 21 13.5 21C17.805 21 21.4313 22.9437 24 26"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M25 8.59253C25.6599 10.1445 26 11.8136 26 13.5C26 15.1865 25.6599 16.8556 25 18.4075"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M28.6699 7C29.5475 9.05467 29.9999 11.2658 29.9999 13.5C29.9999 15.7342 29.5475 17.9453 28.6699 20"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3662_17652">
                        <rect width="32" height="32" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-[#0F0F0] leading-[24px]">
                    Avoid use of abusive or offensive language
                  </h2>
                  <p className="text-[16px] text-[#5A5A5A] font-normal leading-[24px]">
                    Show respect for opinions, avoid personal attacks and
                    refrain from pushing harmful agendas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-[40px]">
                <div className="text-gray-900 mt-1 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_3662_17662)">
                      <path
                        d="M24.4856 24.485L7.51562 7.51501"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3662_17662">
                        <rect width="32" height="32" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-[#0F0F0] leading-[24px]">
                    No spam, plagiarism or copyright violation
                  </h2>
                  <p className="text-[16px] text-[#5A5A5A] font-normal leading-[24px]">
                    No product promotion, using content without permission or
                    sharing malicious contents or page links.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-[40px]">
                <div className="text-gray-900 mt-1 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_3662_17670)">
                      <path
                        d="M1 15H31"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M9.5 26C11.433 26 13 24.433 13 22.5C13 20.567 11.433 19 9.5 19C7.567 19 6 20.567 6 22.5C6 24.433 7.567 26 9.5 26Z"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M22.5 26C24.433 26 26 24.433 26 22.5C26 20.567 24.433 19 22.5 19C20.567 19 19 20.567 19 22.5C19 24.433 20.567 26 22.5 26Z"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12.9648 23H19.0348"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5 15L11.2362 6.41129C11.3268 6.28727 11.4447 6.18577 11.5808 6.11466C11.7169 6.04355 11.8675 6.00474 12.0211 6.00124C12.1746 5.99773 12.3268 6.02963 12.466 6.09445C12.6052 6.15927 12.7276 6.25528 12.8237 6.37504L14.4412 8.25004C14.6287 8.48317 14.866 8.6713 15.1358 8.80056C15.4055 8.92982 15.7009 8.99692 16 8.99692C16.2991 8.99692 16.5945 8.92982 16.8642 8.80056C17.134 8.6713 17.3713 8.48317 17.5588 8.25004L19.1763 6.37504C19.2724 6.25528 19.3948 6.15927 19.534 6.09445C19.6732 6.02963 19.8254 5.99773 19.9789 6.00124C20.1325 6.00474 20.2831 6.04355 20.4192 6.11466C20.5553 6.18577 20.6732 6.28727 20.7638 6.41129L27 15"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3662_17670">
                        <rect width="32" height="32" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-[#0F0F0] leading-[24px]">
                    No misrepresentation of any form
                  </h2>
                  <p className="text-[16px] text-[#5A5A5A] font-normal leading-[24px]">
                    Avoid impersonation of any form and share only credible
                    information sources.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-[40px]">
                <div className="text-gray-900 mt-1 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_3662_17681)">
                      <path
                        d="M16 2V1"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M25 5L26 4"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7 5L6 4"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M6 21V16C5.99996 14.6804 6.26112 13.3738 6.76843 12.1555C7.27574 10.9373 8.01916 9.83147 8.95584 8.90188C9.89252 7.97229 11.0039 7.23729 12.226 6.73925C13.4481 6.24121 14.7566 5.98998 16.0763 6.00005C21.59 6.0413 26 10.6113 26 16.125V21"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M17 10C19.8375 10.4762 22 13.0275 22 16"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M27 21H5C4.44772 21 4 21.4477 4 22V25C4 25.5523 4.44772 26 5 26H27C27.5523 26 28 25.5523 28 25V22C28 21.4477 27.5523 21 27 21Z"
                        stroke="#0F0F0F"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3662_17681">
                        <rect width="32" height="32" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[16px] font-semibold text-[#0F0F0] leading-[24px]">
                    Report violations
                  </h2>
                  <p className="text-[16px] text-[#5A5A5A] font-normal leading-[24px]">
                    Use our reporting features to report inappropriate comments
                    or harassment of any form.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center space-y-4">
              <Button
                variant="primary"
                className="rounded-[10px]"
                onClick={Continue}
              >
                Continue
              </Button>

              <a
                href="#"
                className="block text-xs sm:text-sm font-bold text-gray-900 hover:underline pt-1"
              >
                Read more of our guidelines and policies
              </a>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default WelcomeComments;
