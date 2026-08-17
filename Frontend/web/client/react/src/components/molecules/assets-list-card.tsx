import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AssetIcon from "../../assets/icons/fund-icon.svg";
import type { AssetsListCardProps } from "../../features/ui/invest/investments/assets-list/interface";
import { useUser } from "../../contexts/userContext";
import isKycComplete from "../../hooks/isKycComplete";
import isAdditionalKycComplete from "../../hooks/isAdditionalKycComplete";
import AccountVerification from "../dialogs/account-verification";
import AdditionalKyc from "../dialogs/additional-kyc";
import SelectAccountToInvest from "../dialogs/select-account-to-invest";

const AssetsListCard = (props: AssetsListCardProps) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [openAccountVerification, setOpenAccountVerification] = useState(false);
  const [openAdditionalKyc, setOpenAdditionalKyc] = useState(false);
  const [openSelectAccount, setOpenSelectAccount] = useState(false);

  const [imgError, setImgError] = useState(false);

  const formattedPrice = props.price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const showInitials = !props.logo?.trim() || imgError;

  const handleClick = () => {
    if (!isKycComplete(currentUser)) {
      setOpenAccountVerification(true);
      return;
    }
    if (!isAdditionalKycComplete(currentUser)) {
      setOpenAdditionalKyc(true);
      return;
    }
    setOpenSelectAccount(true);
  };

  return (
    <>
    <div
      onClick={handleClick}
      className="block h-full cursor-pointer"
    >
      <div className="group relative border border-[#EAEAEA] bg-gradient-to-b from-white to-[#FCFCFC] rounded-[16px] p-[24px] cursor-pointer h-full flex flex-col transition-all duration-300 hover:border-[#D1D1D1] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-[2px]">
        {/* Top section */}
        <div className="flex flex-col gap-[20px]">
          <div className="flex items-start justify-between">
            <div
              className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F8FAFC] shadow-sm border border-[#EAEAEA] overflow-hidden transition-transform duration-300 group-hover:scale-105"
            >
              {showInitials ? (
                <span className="text-[#888] font-bold text-[18px]">
                  {getInitials(props.fundName)}
                </span>
              ) : (
                <img
                  src={props.logo?.trim()}
                  alt={props.fundName}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            
            {/* Risk Level Badge */}
            <div className={`flex items-center gap-[6px] px-[10px] py-[4px] rounded-full border ${
              props.riskLevel === "Conservative" ? "border-[#E0FAF2] bg-[#F4FDF9]" : 
              props.riskLevel === "Moderate" ? "border-[#FFF2DC] bg-[#FFFAF2]" : 
              "border-[#FFE5E8] bg-[#FFF2F4]"
            }`}>
              <div className={`w-[6px] h-[6px] rounded-full ${
                props.riskLevel === "Conservative" ? "bg-[#00868D]" : 
                props.riskLevel === "Moderate" ? "bg-[#D99A1A]" : 
                "bg-[#D92D39]"
              }`} />
              <span className={`text-[11px] font-semibold tracking-wide uppercase ${
                props.riskLevel === "Conservative" ? "text-[#00868D]" : 
                props.riskLevel === "Moderate" ? "text-[#D99A1A]" : 
                "text-[#D92D39]"
              }`}>
                {props.riskLevel}
              </span>
            </div>
          </div>

          <h3 className="text-[#111] text-[17px] font-bold leading-[24px] tracking-[-0.2px] line-clamp-2">
            {props.fundName}
          </h3>
        </div>

        {/* Spacer */}
        <div className="flex-grow min-h-[32px]" />

        {/* Bottom section with subtle divider */}
        <div className="flex items-end justify-between pt-[20px] border-t border-[#F0F0F0]">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#888] text-[11px] font-semibold tracking-wider uppercase">
              Price
            </span>
            <span className="text-[#111] text-[20px] font-bold tracking-tight">
              {props.currency === 'NGN' ? '₦' : props.currency === 'USD' ? '$' : props.currency}{formattedPrice}
            </span>
          </div>
          
          <div className="flex flex-col items-end gap-[4px]">
            <span className="text-[#888] text-[11px] font-semibold tracking-wider uppercase">
              Yield
            </span>
            <span className={`text-[20px] font-bold tracking-tight ${
              parseFloat(props.yield) > 0 ? "text-[#00868D]" : "text-[#111]"
            }`}>
              {props.yield}
            </span>
          </div>
        </div>
      </div>
    </div>
    <AccountVerification
      openDialog={openAccountVerification}
      setDialog={setOpenAccountVerification}
    />
    <AdditionalKyc
      openAdditionalKycDialog={openAdditionalKyc}
      setAdditionalKycDialog={setOpenAdditionalKyc}
    />
    <SelectAccountToInvest
      openDialog={openSelectAccount}
      setDialog={setOpenSelectAccount}
      currentUser={currentUser}
      targetAssetId={props.asset_id}
      productType={props.productType}
    />
    </>
  );
};

export default AssetsListCard;
