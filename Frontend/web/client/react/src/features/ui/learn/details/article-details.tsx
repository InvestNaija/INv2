import { useState } from "react";
import WelcomeComments from "../../../../components/dialogs/welcome-comments";
import Back from "../../../../components/molecules/back";
import Comments from "../../../../components/dialogs/comments";

const ArticleDetails = () => {
  const [openWelcomeCommentsDialog, setWelcomeCommentsDialog] = useState(false);
  const [openCommentsDialog, setCommentsDialog] = useState(false);

  const handleWelcomeCommentsDialogOpen = () => {
    setWelcomeCommentsDialog(true);
  };

    const handleCommentsDialogOpen = () => {
    setCommentsDialog(true);
  };

  return (
    <>
      <WelcomeComments
        openWelcomeCommentsDialog={openWelcomeCommentsDialog}
        setWelcomeCommentsDialog={setWelcomeCommentsDialog}
      ></WelcomeComments>
      <Comments
        openCommentsDialog={openCommentsDialog}
        setCommentsDialog={setCommentsDialog}
      ></Comments>
      <main className="max-w-3xl mx-auto px-4">
        <div className="flex flex-start py-[16px]">
          <Back name="Back" />
        </div>

        <section className="mt-[24px]">
          <h1 className="text-[24px] font-bold text-[#0F0F0F] tracking-[-0.48px] leading-[36px]">
            Daily Nigerian Economic and Business News
          </h1>

          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-500 list-disc pl-5 font-normal leading-relaxed mt-[32px]">
            <li>Screening of nominees for CBN Governor Deputies today.</li>
            <li>Dangote cement slashes price as price war heats up.</li>
            <li>
              Forex hits an all time high with predictions suggesting more
              turmoil for fx.
            </li>
            <li>FG to implement new monetary policies curb inflation</li>
            <li>
              Customs slash import duties tax by 50% on raw materials, vehicles
              and electronics
            </li>
          </ul>
        </section>

        <div className="flex items-center my-[32px] gap-4">
          <div className="w-10 h-10 rounded-full bg-[#111e25] flex items-center justify-center flex-shrink-0 border border-gray-800">
            <span className="text-[10px] font-bold text-amber-500 tracking-tighter">
              CHD
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-[#0F0F0F] leading-[20px] tracking-[0.28px]">
              CHD Research
            </span>
            <span className="text-[12px] text-[#BFBFBF] font-medium leading-[16px] tracking-[-0.12px]">
              13 Sep 2023 • 5 min read
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100/80 py-[13.5px]">
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-[#E5E5E5] rounded-full text-[14px] font-medium text-[#0F0F0F] hover:bg-gray-50 transition shadow-xs leading-[20px] tracking-[0.035px]">
              <i className="ri-heart-line"></i>
              <span>13</span>
            </button>

            <button
              onClick={handleWelcomeCommentsDialogOpen}
              className="cursor-pointer inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-[#E5E5E5] rounded-full text-[14px] font-medium text-[#0F0F0F] hover:bg-gray-50 transition shadow-xs leading-[20px] tracking-[0.035px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_5020_216)">
                  <path
                    d="M8.25 8.625C8.59518 8.625 8.875 8.34518 8.875 8C8.875 7.65482 8.59518 7.375 8.25 7.375C7.90482 7.375 7.625 7.65482 7.625 8C7.625 8.34518 7.90482 8.625 8.25 8.625Z"
                    fill="#0F0F0F"
                  />
                  <path
                    d="M5.5 8.625C5.84518 8.625 6.125 8.34518 6.125 8C6.125 7.65482 5.84518 7.375 5.5 7.375C5.15482 7.375 4.875 7.65482 4.875 8C4.875 8.34518 5.15482 8.625 5.5 8.625Z"
                    fill="#0F0F0F"
                  />
                  <path
                    d="M11 8.625C11.3452 8.625 11.625 8.34518 11.625 8C11.625 7.65482 11.3452 7.375 11 7.375C10.6548 7.375 10.375 7.65482 10.375 8C10.375 8.34518 10.6548 8.625 11 8.625Z"
                    fill="#0F0F0F"
                  />
                  <path
                    d="M8.25 13.5H3C2.86739 13.5 2.74021 13.4473 2.64645 13.3536C2.55268 13.2598 2.5 13.1326 2.5 13V7.75C2.5 6.22501 3.1058 4.76247 4.18414 3.68414C5.26247 2.6058 6.72501 2 8.25 2C9.0051 2 9.75281 2.14873 10.4504 2.43769C11.1481 2.72666 11.7819 3.1502 12.3159 3.68414C12.8498 4.21807 13.2733 4.85195 13.5623 5.54957C13.8513 6.24719 14 6.9949 14 7.75C14 8.5051 13.8513 9.25281 13.5623 9.95043C13.2733 10.6481 12.8498 11.2819 12.3159 11.8159C11.7819 12.3498 11.1481 12.7733 10.4504 13.0623C9.75281 13.3513 9.0051 13.5 8.25 13.5Z"
                    stroke="#0F0F0F"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_5020_216">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span>13</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E5E5] rounded-full text-[14px] font-medium text-[#0F0F0F] hover:bg-gray-50 transition shadow-xs leading-[20px] tracking-[0.035px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
            </button>

            <button className="px-4 py-1.5 border border-[#E5E5E5] rounded-full text-[14px] font-medium text-[#0F0F0F] hover:bg-gray-50 transition shadow-xs leading-[20px] tracking-[0.035px]">
              Share
            </button>
          </div>
        </div>

        <section className="pt-2 space-y-4">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight">
            Screening of nominees for CBN Governor Deputies begins today
          </h2>

          <div className="w-full rounded-2xl overflow-hidden bg-gray-100 shadow-xs aspect-[16/10] sm:aspect-[16/9]">
            <img
              src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"
              alt="Nigerian Senate National Assembly Dome Building"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <p>
              The Nigerian senate is set to begin the screening process of the
              nominated deputies for the Central Bank of Nigeria (CBN) today.
              The process which will commence at 9 am today and is expected to
              end today. The 4 nominees for the role of the deputy governor for
              the apex bank include
            </p>

            <ul className="list-disc pl-6 space-y-1 text-gray-900">
              <li>Deji Ayeni</li>
              <li>Mouruf Dele</li>
              <li>Martin Aare</li>
              <li>Kemi Ajayi</li>
            </ul>
          </div>

          <div className="pt-4 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-snug">
              Price wars: Dangote cement cuts unit price by 25% after Ibeto and
              Lafarge
            </h2>

            <p>
              The cement price wars in Nigeria is heating, as top market holders
              are looking to lock in on more buyers.
              <br />
              Last week, Lafarge cement announced a 30% cut in unit prices
              prompting Bua cement to respond in similar fashion as well the
              market size leader Dangote joining in.
            </p>

            <p>
              A further look into the market from a survey, shows that most
              customers are happy with the development and will most likely lean
              towards the cheaper option as long as quality is not compromised.
            </p>

            <p>
              However, the price wars suggests that the cement producers have
              finally taken the cue that the customer is king and there is a
              need to promote sense of loyalty from both ends, as customers are
              10 times more likely to continue with a producer they have known
              over the years.
            </p>
          </div>

          <div className="pt-4">
            <div className="w-full h-44 sm:h-56 bg-emerald-50/50 rounded-xl relative overflow-hidden flex items-end justify-center space-x-4 pb-0">
              <div className="w-12 sm:w-16 h-3/4 bg-emerald-200/70 rounded-t-md transition hover:bg-emerald-300"></div>
              <div className="w-12 sm:w-16 h-1/2 bg-emerald-400/60 rounded-t-md transition hover:bg-emerald-400"></div>
              <div className="w-12 sm:w-16 h-1/6 bg-emerald-500/60 rounded-t-md transition hover:bg-emerald-500"></div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ArticleDetails;
