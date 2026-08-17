import {
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";

interface RiskProfileModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  riskLevel: string;
}

const RiskProfileModal = ({
  open,
  setOpen,
  riskLevel,
}: RiskProfileModalProps) => {
  const handleClose = () => {
    setOpen(false);
  };

  const getRiskDetails = (level: string) => {
    switch (level) {
      case "Conservative":
        return {
          title: "Conservative",
          subtitle: "Low Risk, Stable Returns",
          description:
            "Typically suited for investors seeking stability and capital preservation over high returns. These investments have a lower risk of loss but also offer lower potential for significant growth.",
          color: "text-[#44A185]",
          bgColor: "bg-[#44A185]/10",
          iconColor: "text-[#44A185]",
          bgGradient: "bg-gradient-to-br from-[#44A185]/20 to-transparent",
          progress: 25,
          progressColor: "bg-[#44A185]"
        };
      case "Moderate":
        return {
          title: "Moderate",
          subtitle: "Balanced Risk & Reward",
          description:
            "A balanced approach aiming for steady growth with a moderate level of risk. Investments may experience some fluctuations in value, offering a middle ground between security and return.",
          color: "text-[#EBA421]",
          bgColor: "bg-[#EBA421]/10",
          iconColor: "text-[#EBA421]",
          bgGradient: "bg-gradient-to-br from-[#EBA421]/20 to-transparent",
          progress: 50,
          progressColor: "bg-[#EBA421]"
        };
      case "Aggressive":
        return {
          title: "Aggressive",
          subtitle: "High Risk, Maximum Growth",
          description:
            "Suited for investors aiming for high long-term returns and willing to accept significant market fluctuations and a higher risk of loss.",
          color: "text-[#E5333E]",
          bgColor: "bg-[#E5333E]/10",
          iconColor: "text-[#E5333E]",
          bgGradient: "bg-gradient-to-br from-[#E5333E]/20 to-transparent",
          progress: 85,
          progressColor: "bg-[#E5333E]"
        };
      default:
        return {
          title: "Risk Appetite",
          subtitle: "Investment Risk Profile",
          description:
            "Risk appetite refers to the level of risk you are willing to accept in pursuit of returns.",
          color: "text-[#8C98A4]",
          bgColor: "bg-[#8C98A4]/10",
          iconColor: "text-[#8C98A4]",
          bgGradient: "bg-gradient-to-br from-[#8C98A4]/20 to-transparent",
          progress: 0,
          progressColor: "bg-[#8C98A4]"
        };
    }
  };

  const details = getRiskDetails(riskLevel);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          },
        },
      }}
    >
      <div className={`relative w-full h-[140px] ${details.bgGradient} flex items-center justify-center overflow-hidden`}>
        {/* Background decorative circles */}
        <div className={`absolute top-[-30px] right-[-30px] w-[120px] h-[120px] rounded-full ${details.bgColor} blur-2xl`}></div>
        <div className={`absolute bottom-[-20px] left-[-20px] w-[100px] h-[100px] rounded-full ${details.bgColor} blur-xl`}></div>
        
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={handleClose} 
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-white/60 hover:bg-white/90 backdrop-blur-sm transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-[20px] text-gray-700"></i>
          </button>
        </div>

        {/* Big Icon */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`flex items-center justify-center h-[72px] w-[72px] rounded-full bg-white shadow-sm border border-white/50 mb-2`}>
            <i className={`ri-shield-star-fill text-[36px] ${details.iconColor}`}></i>
          </div>
        </div>
      </div>

      <DialogContent sx={{ p: '32px 24px 24px', position: 'relative' }}>
        <div className="flex flex-col text-center">
          <h2 className={`text-[24px] font-extrabold tracking-tight ${details.color} mb-1`}>
            {details.title} Risk
          </h2>
          <span className="text-[14px] font-medium text-[#8C98A4] mb-6 uppercase tracking-wider">
            {details.subtitle}
          </span>
          
          <p className="text-[15px] leading-[26px] text-(--text-content-subtle) text-center mb-8 px-2">
            {details.description}
          </p>

          <div className="w-full mb-8">
            <div className="flex justify-between text-[12px] font-semibold text-[#8C98A4] mb-2 px-1 uppercase tracking-widest">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-[8px] overflow-hidden">
              <div 
                className={`${details.progressColor} h-[8px] rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${details.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-gray-50/80 rounded-[16px] border border-gray-100 flex gap-3 items-start text-left">
            <i className="ri-information-fill text-[20px] text-gray-400 mt-0.5"></i>
            <p className="text-[13px] leading-[20px] text-gray-500">
              All investments carry some level of risk. Past performance does not guarantee future results. Please invest carefully.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskProfileModal;
