import { useRef } from "react";
import SaveListCard from "../../../../components/molecules/save-list-card";
import type { SavePlanListCardProps } from "./interface";

const SaveList = (props: { saveList: SavePlanListCardProps[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += offset;
    }
  };

  const handleScroll = (event?: React.UIEvent<HTMLDivElement>) => {
    // const target = event.currentTarget;
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
           <div>
            <h6 className="text-[14px] text-[#0F0F0F] font-semibold leading-[20px] tracking-[0.1px]">Start saving</h6>
           </div>
              <div className="flex gap-2 items-center">
                   <div
                onClick={() => scroll(-200)}
                className="cursor-pointer flex h-[32px] w-[32px] items-center justify-center rounded-[999px] bg-[#EEE]"
              >
                <i className="ri-arrow-left-s-line rounded-[99px]"></i>
              </div>
                   <div
                onClick={() => scroll(200)}
                className="cursor-pointer flex h-[32px] w-[32px] items-center justify-center rounded-[999px] bg-[#EEE]"
              >
                <i className="ri-arrow-right-s-line rounded-[99px]"></i>
              </div>
              </div>
        </div>
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            overflowX: "scroll",
            scrollBehavior: "smooth",
          }}
          onScroll={handleScroll}
          className="gap-4 mt-[16px] py-[24px] px-[8px] -mx-[8px]"
        >
          {props.saveList.map((save, index) => (
            <SaveListCard key={index} {...save} />
          ))}
        </div>
        
      </div>
    </>
  );
};

export default SaveList;
