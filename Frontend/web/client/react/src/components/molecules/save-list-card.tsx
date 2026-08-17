import React, { useState } from "react";
import SaveIcon from "../../assets/icons/saveplan.svg";
import type { SavePlanListCardProps } from "../../features/ui/save/save-list/interface";
import { useNavigate } from "react-router-dom";
import CustomPlanModal from "../dialogs/custom-plan-modal";
import AccountVerification from "../dialogs/account-verification";
import AdditionalKyc from "../dialogs/additional-kyc";
import { useUser } from "../../contexts/userContext";
import isKycComplete from "../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../hooks/isAdditionalKycComplete";

const SaveListCard = (props: SavePlanListCardProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const handleBuyPlanDialog = () => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    if (props.id === "custom") {
      setOpenModal(true);
    } else {
      navigate(`/app/save/drill-down/${props.id}`);
    }
  };

  const themes = [
    { bg: "bg-gradient-to-br from-[#FFF5ED] to-[#FFE3D1]", iconBg: "bg-white/20 border border-white/40", accent: "text-[#E77731]" },
    { bg: "bg-gradient-to-br from-[#F0F7FF] to-[#D6E8FF]", iconBg: "bg-white/20 border border-white/40", accent: "text-[#3182CE]" },
    { bg: "bg-gradient-to-br from-[#EEFDF4] to-[#C9F3D8]", iconBg: "bg-white/20 border border-white/40", accent: "text-[#38A169]" },
    { bg: "bg-gradient-to-br from-[#F8F2FF] to-[#EBD9FF]", iconBg: "bg-white/20 border border-white/40", accent: "text-[#805AD5]" },
    { bg: "bg-gradient-to-br from-[#FFFCEB] to-[#FEF3AD]", iconBg: "bg-white/20 border border-white/40", accent: "text-[#D69E2E]" },
  ];

  // Hash function to pick a color
  const getThemeIndex = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % themes.length;
  };

  const t = themes[getThemeIndex(props.name || "A")];

  return (
    <>
      <div 
        onClick={handleBuyPlanDialog} 
        className={`group relative flex flex-col w-[260px] min-w-[260px] h-[240px] ${t.bg} rounded-[28px] cursor-pointer transition-all duration-400 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 p-[20px] overflow-hidden isolate shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),inset_0_2px_4px_rgba(255,255,255,0.4)]`}
      >
        {/* Decorative background flares */}
        <div className="absolute -top-[30px] -right-[30px] w-[140px] h-[140px] bg-white/60 rounded-full blur-[25px] -z-10 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute -bottom-[20px] -left-[20px] w-[100px] h-[100px] bg-white/40 rounded-full blur-[20px] -z-10"></div>

        {/* Top Icon */}
        <div className={`w-[56px] h-[56px] rounded-[18px] overflow-hidden ${t.iconBg} backdrop-blur-md flex items-center justify-center mb-[14px] transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)]`}>
          <img 
            src={props.image || SaveIcon} 
            alt={`${props.name} cover`} 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = SaveIcon; }}
          />
        </div>

        {/* Content Area */}
        <h3 className="text-[#111111] text-[19px] font-extrabold tracking-tight leading-[1.15]">
          {props.name}
        </h3>
        <p className="mt-[6px] text-[#4A4A4A] text-[13px] font-medium leading-[1.4] line-clamp-2">
          {props.description}
        </p>

        {/* Footer / Action */}
        <div className="mt-auto">
          <div className="flex items-center justify-between w-full bg-white/80 group-hover:bg-white backdrop-blur-md rounded-[16px] p-[6px] pl-[16px] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <span className={`text-[13px] font-bold ${t.accent}`}>
              Start saving
            </span>
            <div className="w-[32px] h-[32px] rounded-full bg-[#111111] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
              <i className="ri-arrow-right-line text-white text-[16px] group-hover:translate-x-0.5 transition-transform duration-300"></i>
            </div>
          </div>
        </div>
      </div>
      
      {props.id === "custom" && <CustomPlanModal open={openModal} setOpen={setOpenModal} />}
      <AccountVerification
        openDialog={openAccountVerification}
        setDialog={setOpenAccountVerification}
      />
      <AdditionalKyc
        openAdditionalKycDialog={openAdditionalKyc}
        setAdditionalKycDialog={setOpenAdditionalKyc}
      />
    </>
  );
};

export default SaveListCard;
