import { Dialog, type DialogProps } from "@mui/material";

interface CommentsProps {
  setCommentsDialog: (open: boolean) => void;
  openCommentsDialog: boolean;
}

const Comments = (props: CommentsProps) => {
  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      props.setCommentsDialog(false);
    }
  };

  return (
    <>
      <Dialog
        open={props.openCommentsDialog}
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
              borderRadius: "0", // Add rounded corners
              padding: "16px",
              //   width: "40%",
              //   minWidth: "90%",

              height: "100vh !important",
              maxHeight: "100vh !important",
              position: "absolute",
              top: "0",
              right: "0",
              margin: "0",
            },
          },
        }}
      >
        <div>
          <div className="w-full max-w-md bg-white min-h-screen  flex flex-col">
            <header className="py-[24px] flex items-center justify-between">
              <h2 className="font-semibold text-[20px] tracking-[-0.4px] leading-[28px] text-[#222]">
                Comments (5)
              </h2>
              <button
                className="text-[#0F0F0F] hover:text-gray-600 transition cursor-pointer"
                onClick={() => props.setCommentsDialog(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </header>

            {/* <div className="mt-4">
      <input 
        type="text" 
        placeholder="Share your thoughts" 
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 outline-none focus:border-gray-400 transition"
      />
    </div> */}

            {/* <!-- Interactive Input Wrapper Container matching Screenshot 2026-06-23 at 15.57.27.png layout rules --> */}
            <div className="w-full max-w-md bg-white mt-4 mb-[24px] mt-[16px]">
              {/* <!-- Input Box Box Container State --> */}
              <div className="relative bg-white border border-emerald-600 rounded-xl px-4 py-3 shadow-xs group focus-within:ring-1 focus-within:ring-emerald-600 transition duration-150">
                {/* <!-- Text Area Content --> */}
                <textarea
                  rows={2}
                  className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none pr-8 font-normal leading-relaxed"
                  placeholder="Share your thoughts"
                >
                  Thank you
                </textarea>

                {/* <!-- Absolute Green Check Circle Status indicator matching graphic mock --> */}
                <div className="absolute top-3.5 right-3.5 text-emerald-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.748-5.25z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* <!-- Action Toolbar Row Controls --> */}
              <div className="flex items-center justify-end space-x-3 mt-[24px]">
                {/* <!-- Cancel Muted Accent Button --> */}
                <button
                  type="button"
                  className="px-5 py-2 text-sm font-bold text-teal-700/90 hover:text-teal-900 transition-colors"
                >
                  Cancel
                </button>

                {/* <!-- Light Teal Round Rounded Send Button Pillar --> */}
                <button
                  type="submit"
                  className="bg-[#99e2e6] hover:bg-[#7bcad0] text-teal-900 font-bold text-sm px-6 py-2 rounded-full transition-all shadow-xs"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[#EDEDED] mt-[24px] py-[24px] px-[16px]">
              <span className="text-[16px] font-bold text-[#0F0F0F] leading-[24px]">
                Top comment
              </span>
              <button
                className="text-gray-900 hover:text-gray-600 transition"
                title="Sort threads"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g clip-path="url(#clip0_3676_5258)">
                    <path
                      d="M10.5 16.5L7.5 19.5L4.5 16.5"
                      stroke="#0F0F0F"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M7.5 4.5V19.5"
                      stroke="#0F0F0F"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M13.5 7.5L16.5 4.5L19.5 7.5"
                      stroke="#0F0F0F"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M16.5 19.5V4.5"
                      stroke="#0F0F0F"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_3676_5258">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto  divide-y divide-[#EDEDED] pb-8">

              <article className="py-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    className="w-9 h-9 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                    alt="Bukola Sufyan"
                  />
                  <div className="text-xs">
                    <h4 className="font-bold text-gray-900">Bukola Sufyan</h4>
                    <p className="text-gray-400 font-medium">
                      10:03 am &bull; 2 February 2024
                    </p>
                  </div>
                </div>
                 <div className="w-full max-w-md bg-white mt-4 mb-[24px] mt-[16px]">
              {/* <!-- Input Box Box Container State --> */}
              <div className="relative bg-white border border-emerald-600 rounded-xl px-4 py-3 shadow-xs group focus-within:ring-1 focus-within:ring-emerald-600 transition duration-150">
                {/* <!-- Text Area Content --> */}
                <textarea
                  rows={2}
                  className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none pr-8 font-normal leading-relaxed"
                  placeholder="Share your thoughts"
                >
                  The best financial advice i never knew i needed and this is coming at the right time.
                </textarea>

                {/* <!-- Absolute Green Check Circle Status indicator matching graphic mock --> */}
                <div className="absolute top-3.5 right-3.5 text-emerald-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.748-5.25z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* <!-- Action Toolbar Row Controls --> */}
              <div className="flex items-center justify-end space-x-3 mt-[24px]">
                {/* <!-- Cancel Muted Accent Button --> */}
                <button
                  type="button"
                  className="px-5 py-2 text-sm font-bold text-teal-700/90 hover:text-teal-900 transition-colors"
                >
                  Cancel
                </button>

                {/* <!-- Light Teal Round Rounded Send Button Pillar --> */}
                <button
                  type="submit"
                  className="bg-[#99e2e6] hover:bg-[#7bcad0] text-teal-900 font-bold text-sm px-6 py-2 rounded-full transition-all shadow-xs"
                >
                  Update
                </button>
              </div>
            </div>
                {/* <p className="text-sm text-gray-800 font-normal leading-relaxed">
                  Do you mind making this into a weekly series.
                </p> */}
                {/* <div className="flex items-center justify-between text-gray-400 pt-1">
                  <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                      <span>0</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                      </svg>
                      <span>0</span>
                    </button>
                  </div>
                 <button className=" transition cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4.16667 8.33337C3.25 8.33337 2.5 9.08337 2.5 10C2.5 10.9167 3.25 11.6667 4.16667 11.6667C5.08333 11.6667 5.83333 10.9167 5.83333 10C5.83333 9.08337 5.08333 8.33337 4.16667 8.33337ZM15.8333 8.33337C14.9167 8.33337 14.1667 9.08337 14.1667 10C14.1667 10.9167 14.9167 11.6667 15.8333 11.6667C16.75 11.6667 17.5 10.9167 17.5 10C17.5 9.08337 16.75 8.33337 15.8333 8.33337ZM10 8.33337C9.08333 8.33337 8.33333 9.08337 8.33333 10C8.33333 10.9167 9.08333 11.6667 10 11.6667C10.9167 11.6667 11.6667 10.9167 11.6667 10C11.6667 9.08337 10.9167 8.33337 10 8.33337Z"
                        fill="#0F0F0F"
                      />
                    </svg>
                  </button>
                </div> */}
              </article>


              
              <article className="py-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    className="w-9 h-9 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Frances Ajumobi"
                  />
                  <div className="text-xs">
                    <h4 className="font-bold text-gray-900">Frances Ajumobi</h4>
                    <p className="text-gray-400 font-medium">
                      09:03 am &bull; 2 February 2024
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 font-normal leading-relaxed">
                  Financial advice i never knew i needed
                </p>
                <div className="flex items-center justify-between text-gray-400 pt-1">
                  <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                      <span>90</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                      </svg>
                      <span>50</span>
                    </button>
                  </div>
                  <button className=" transition cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4.16667 8.33337C3.25 8.33337 2.5 9.08337 2.5 10C2.5 10.9167 3.25 11.6667 4.16667 11.6667C5.08333 11.6667 5.83333 10.9167 5.83333 10C5.83333 9.08337 5.08333 8.33337 4.16667 8.33337ZM15.8333 8.33337C14.9167 8.33337 14.1667 9.08337 14.1667 10C14.1667 10.9167 14.9167 11.6667 15.8333 11.6667C16.75 11.6667 17.5 10.9167 17.5 10C17.5 9.08337 16.75 8.33337 15.8333 8.33337ZM10 8.33337C9.08333 8.33337 8.33333 9.08337 8.33333 10C8.33333 10.9167 9.08333 11.6667 10 11.6667C10.9167 11.6667 11.6667 10.9167 11.6667 10C11.6667 9.08337 10.9167 8.33337 10 8.33337Z"
                        fill="#0F0F0F"
                      />
                    </svg>
                  </button>
                </div>
              </article>

              <article className="py-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    className="w-9 h-9 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                    alt="Bukola Sufyan"
                  />
                  <div className="text-xs">
                    <h4 className="font-bold text-gray-900">Bukola Sufyan</h4>
                    <p className="text-gray-400 font-medium">
                      10:03 am &bull; 2 February 2024
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 font-normal leading-relaxed">
                  Do you mind making this into a weekly series.
                </p>
                <div className="flex items-center justify-between text-gray-400 pt-1">
                  <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                      <span>0</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                      </svg>
                      <span>0</span>
                    </button>
                  </div>
                 <button className=" transition cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4.16667 8.33337C3.25 8.33337 2.5 9.08337 2.5 10C2.5 10.9167 3.25 11.6667 4.16667 11.6667C5.08333 11.6667 5.83333 10.9167 5.83333 10C5.83333 9.08337 5.08333 8.33337 4.16667 8.33337ZM15.8333 8.33337C14.9167 8.33337 14.1667 9.08337 14.1667 10C14.1667 10.9167 14.9167 11.6667 15.8333 11.6667C16.75 11.6667 17.5 10.9167 17.5 10C17.5 9.08337 16.75 8.33337 15.8333 8.33337ZM10 8.33337C9.08333 8.33337 8.33333 9.08337 8.33333 10C8.33333 10.9167 9.08333 11.6667 10 11.6667C10.9167 11.6667 11.6667 10.9167 11.6667 10C11.6667 9.08337 10.9167 8.33337 10 8.33337Z"
                        fill="#0F0F0F"
                      />
                    </svg>
                  </button>
                </div>
              </article>

              <article className="py-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    className="w-9 h-9 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Minaso Koko"
                  />
                  <div className="text-xs">
                    <h4 className="font-bold text-gray-900">Minaso Koko <span>
          <span className="bg-[#2563eb] text-[11px] font-bold text-white px-2.5 py-0.5 rounded-md tracking-normal transform scale-95 origin-left leading-none">
            Author
          </span></span></h4>
                    <p className="text-gray-400 font-medium">
                      11:03 am &bull; 2 February 2024
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 font-normal leading-relaxed">
                  Awesome research and article
                </p>
                <div className="flex items-center justify-between text-gray-400 pt-1">
                  <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                      <span>1</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-gray-900 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                      </svg>
                      <span>0</span>
                    </button>
                  </div>
                  <button className=" transition cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4.16667 8.33337C3.25 8.33337 2.5 9.08337 2.5 10C2.5 10.9167 3.25 11.6667 4.16667 11.6667C5.08333 11.6667 5.83333 10.9167 5.83333 10C5.83333 9.08337 5.08333 8.33337 4.16667 8.33337ZM15.8333 8.33337C14.9167 8.33337 14.1667 9.08337 14.1667 10C14.1667 10.9167 14.9167 11.6667 15.8333 11.6667C16.75 11.6667 17.5 10.9167 17.5 10C17.5 9.08337 16.75 8.33337 15.8333 8.33337ZM10 8.33337C9.08333 8.33337 8.33333 9.08337 8.33333 10C8.33333 10.9167 9.08333 11.6667 10 11.6667C10.9167 11.6667 11.6667 10.9167 11.6667 10C11.6667 9.08337 10.9167 8.33337 10 8.33337Z"
                        fill="#0F0F0F"
                      />
                    </svg>
                  </button>
                </div>
              </article>

        
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Comments;
