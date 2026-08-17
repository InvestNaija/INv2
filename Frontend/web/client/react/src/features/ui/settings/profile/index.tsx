import { useRef, useState } from "react";
import { format } from "date-fns";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import UserLogo from "../../../../assets/icons/user.svg";
import Button from "../../../../components/atoms/buttons";
import { useUser } from "../../../../contexts/userContext";
import RiskAssessmentDialog from "../../../../components/dialogs/risk-assessment";
import NextOfKinDialog from "../../../../components/dialogs/next-of-kin";

const displayValue = (value?: string | number | null): string | number =>
  value === null || value === undefined || value === "" ? "Not provided" : value;

const Profile = () => {
  const { currentUser, updateAvatar, isUploadingAvatar } = useUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [openRiskAssessmentDialog, setOpenRiskAssessmentDialog] = useState(false);
  const [openNextOfKinDialog, setOpenNextOfKinDialog] = useState(false);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await updateAvatar(file);
  };

  const handleCopy = async (value: string | number | null | undefined, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const fullName = [
    currentUser?.firstName,
    currentUser?.middleName,
    currentUser?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  let riskClassification = "";
  try {
    const parsed = typeof currentUser?.riskRatings === 'string' 
      ? JSON.parse(currentUser.riskRatings) 
      : currentUser?.riskRatings;
    riskClassification = parsed?.classification || "";
  } catch {
    riskClassification = "";
  }

  return (
    <>
      <div className="w-full max-w-[720px] mt-[8px] flex flex-col gap-[32px]">
        {/* Profile Hero Box */}
        <div className="relative flex items-center gap-[24px] p-[28px] bg-white rounded-[24px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,134,141,0.04)] overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#F0FAFB] rounded-full blur-[60px] opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative shrink-0 z-10">
            <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#F4F4F4] overflow-hidden border-[3px] border-white shadow-sm">
              <img
                src={currentUser?.image || UserLogo}
                className="object-cover h-full w-full"
                alt="User Logo"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#00868D] border-[3px] border-white cursor-pointer disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-sm"
            >
              <i className="ri-camera-fill text-[12px] text-white"></i>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
          
          <div className="flex flex-col z-10">
            <h1 className="text-[22px] text-[#111111] font-extrabold tracking-tight leading-none mb-[12px]">
              {displayValue(fullName)}
            </h1>
            <div className="flex flex-wrap gap-[10px] items-center">
              {riskClassification && (
                <div className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#F0FAFB] rounded-[8px] border border-[#DCEEEF]">
                  <i className="ri-vip-crown-2-fill text-[14px] text-[#00868D]"></i>
                  <span className="text-[13px] font-bold text-[#00868D]">
                    {riskClassification}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] border bg-[#FFF2EA] border-[#FFE2CF]">
                <i className={`${currentUser?.isMinor ? "ri-group-2-fill" : "ri-honour-fill"} text-[14px] text-[#E77731]`}></i>
                <span className="text-[13px] font-bold text-[#E77731]">
                  {currentUser?.isMinor ? "Dependent" : `Tier ${displayValue(currentUser?.tier)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About Me */}
        <div className="flex flex-col gap-[12px]">
          <h5 className="text-[16px] font-extrabold text-[#111111] px-[4px]">
            About me
          </h5>
          <div className="bg-white rounded-[20px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,134,141,0.02)] overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center px-[24px] py-[18px] border-b border-[#F4F4F4] gap-[4px] hover:bg-[#FAFAFA] transition-colors">
              <span className="text-[14px] font-semibold text-[#5A5A5A]">Email</span>
              <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.email)}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center px-[24px] py-[18px] border-b border-[#F4F4F4] gap-[4px] hover:bg-[#FAFAFA] transition-colors">
              <span className="text-[14px] font-semibold text-[#5A5A5A]">Phone number</span>
              <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.phone)}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center px-[24px] py-[18px] gap-[4px] hover:bg-[#FAFAFA] transition-colors">
              <span className="text-[14px] font-semibold text-[#5A5A5A]">Date of birth</span>
              <span className="text-[16px] font-bold text-[#111111]">{currentUser?.dob ? format(new Date(currentUser.dob), "d MMMM yyyy") : displayValue()}</span>
            </div>
          </div>
        </div>

        {/* Investment Profile */}
        <div className="flex flex-col gap-[12px]">
          <h5 className="text-[16px] font-extrabold text-[#111111] px-[4px]">
            Investment Profile
          </h5>
          <div className="bg-white rounded-[20px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,134,141,0.02)] overflow-hidden">
            {!currentUser?.isMinor && (
              <>
                <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#F4F4F4] hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[14px] font-semibold text-[#5A5A5A]">CSCS number</span>
                    <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.cscs)}</span>
                  </div>
                  {currentUser?.cscs && (
                    <button
                      onClick={() => handleCopy(currentUser?.cscs, "CSCS number")}
                      className="w-[36px] h-[36px] rounded-full bg-[#F4F4F4] hover:bg-[#EAEAEA] hover:text-[#111111] flex items-center justify-center text-[#5A5A5A] transition-colors cursor-pointer"
                    >
                      <i className="ri-file-copy-line text-[16px]"></i>
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#F4F4F4] hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[14px] font-semibold text-[#5A5A5A]">CHN number</span>
                    <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.chn)}</span>
                  </div>
                  {currentUser?.chn && (
                    <button
                      onClick={() => handleCopy(currentUser?.chn, "CHN number")}
                      className="w-[36px] h-[36px] rounded-full bg-[#F4F4F4] hover:bg-[#EAEAEA] hover:text-[#111111] flex items-center justify-center text-[#5A5A5A] transition-colors cursor-pointer"
                    >
                      <i className="ri-file-copy-line text-[16px]"></i>
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#F4F4F4] hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[14px] font-semibold text-[#5A5A5A]">BVN</span>
                    <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.bvn)}</span>
                  </div>
                  {currentUser?.bvn && (
                    <button
                      onClick={() => handleCopy(currentUser?.bvn, "BVN")}
                      className="w-[36px] h-[36px] rounded-full bg-[#F4F4F4] hover:bg-[#EAEAEA] hover:text-[#111111] flex items-center justify-center text-[#5A5A5A] transition-colors cursor-pointer"
                    >
                      <i className="ri-file-copy-line text-[16px]"></i>
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#F4F4F4] hover:bg-[#FAFAFA] transition-colors">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[14px] font-semibold text-[#5A5A5A]">NIN</span>
                <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.nin)}</span>
              </div>
              {currentUser?.nin && (
                <button
                  onClick={() => handleCopy(currentUser?.nin, "NIN")}
                  className="w-[36px] h-[36px] rounded-full bg-[#F4F4F4] hover:bg-[#EAEAEA] hover:text-[#111111] flex items-center justify-center text-[#5A5A5A] transition-colors cursor-pointer"
                >
                  <i className="ri-file-copy-line text-[16px]"></i>
                </button>
              )}
            </div>

            {!currentUser?.isMinor && (
              <div className="flex justify-between items-center px-[24px] py-[18px] hover:bg-[#FAFAFA] transition-colors">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[14px] font-semibold text-[#5A5A5A]">Risk assessment</span>
                  <span className="text-[16px] font-bold text-[#111111]">{displayValue(riskClassification)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenRiskAssessmentDialog(true)}
                  className="bg-[#F4F4F4] hover:bg-[#EAEAEA] text-[#111111] rounded-[99px] py-[8px] px-[16px] text-[13px] font-bold transition-colors cursor-pointer border border-[#EAEAEA]"
                >
                  {riskClassification ? "Retake" : "Take assessment"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Next of Kin */}
        {!currentUser?.isMinor && (
          <div className="flex flex-col gap-[12px]">
            <div className="flex items-center justify-between px-[4px]">
              <h5 className="text-[16px] font-extrabold text-[#111111]">
                Next of Kin
              </h5>
              <button
                onClick={() => setOpenNextOfKinDialog(true)}
                className="text-[14px] font-bold text-[#00868D] hover:text-[#007075] transition-colors flex items-center gap-[4px] cursor-pointer"
              >
                <i className="ri-edit-line"></i>
                Edit
              </button>
            </div>
            <div className="bg-white rounded-[20px] border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,134,141,0.02)] overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center px-[24px] py-[18px] border-b border-[#F4F4F4] gap-[4px] hover:bg-[#FAFAFA] transition-colors">
                <span className="text-[14px] font-semibold text-[#5A5A5A]">Full Name</span>
                <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.nextOfKinName)}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center px-[24px] py-[18px] border-b border-[#F4F4F4] gap-[4px] hover:bg-[#FAFAFA] transition-colors">
                <span className="text-[14px] font-semibold text-[#5A5A5A]">Relationship</span>
                <span className="text-[16px] font-bold text-[#111111] capitalize">{displayValue(currentUser?.nextOfKinRelationship)}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center px-[24px] py-[18px] gap-[4px] hover:bg-[#FAFAFA] transition-colors">
                <span className="text-[14px] font-semibold text-[#5A5A5A]">Phone number</span>
                <span className="text-[16px] font-bold text-[#111111]">{displayValue(currentUser?.nextOfKinPhone)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <RiskAssessmentDialog
        open={openRiskAssessmentDialog}
        setOpen={setOpenRiskAssessmentDialog}
      />

      <NextOfKinDialog
        openDialog={openNextOfKinDialog}
        setDialog={setOpenNextOfKinDialog}
      />
    </>
  );
};

export default Profile;
