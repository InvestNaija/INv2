import { useNavigate } from "react-router-dom";
import type { LearnListCardProps } from "../../features/ui/learn/dashboard/interface";

const LearnList = (props: LearnListCardProps) => {
  const navigate = useNavigate();

  const navigateBasedOnType = (learnData: LearnListCardProps) => {
    if (learnData.learnType === "Article") {
      navigate("/app/learn/details/1");
    }
  };

  return (
    <>
      <main>
        <article
          className="flex flex-col-reverse sm:flex-row justify-between items-start gap-4 pt-4 first:pt-0 mt-[24px] cursor-pointer"
          onClick={() => navigateBasedOnType(props)}
        >
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold text-[#0F0F0F]  cursor-pointer leading-snug max-w-xl">
              {props.name}
            </h3>
            <p className="text-sm text-[#5A5A5A] line-clamp-2 max-w-xl">
              {props.description}
            </p>
            <div className="flex items-center justify-between pt-2 max-w-xl">
              <div className="flex items-center space-x-2 text-[14px] text-[#BFBFBF]">
                <span>{props.learnType}</span>
                <span>•</span>
                <span>{props.dateCreated}</span>
                <span>•</span>
                <span>{props.time}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-bookmark-line text-[20px] text-[#BFBFBF]"></i>
              </button>
            </div>
          </div>
          <div className="relative w-28 h-20 sm:w-44 sm:h-28 md:w-52 md:h-32 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group shadow-sm">
            <img
              src={props.image}
              alt="LearnIn"
              className="w-full h-full object-cover mix-blend-multiply transition duration-300 group-hover:scale-105"
            />

            {props.learnType === "Podcast" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white transition group-hover:bg-black/60">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 ml-0.5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
    </>
  );
};

export default LearnList;
