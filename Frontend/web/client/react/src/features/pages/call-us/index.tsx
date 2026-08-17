import Dialog from "@mui/material/Dialog";
import { useState } from "react";

interface CallProps {
  setCallDialog: (open: boolean) => void;
  openCallDialog: boolean;
}

export default function Call(props: CallProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleClose = () => {
    props.setCallDialog(false);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("info@investnaija.com");
    setCopiedEmail(true);
    setTimeout(() => {
      setCopiedEmail(false);
    }, 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("02013301777");
    setCopiedPhone(true);
    setTimeout(() => {
      setCopiedPhone(false);
    }, 2000);
  };

  return (
    <Dialog
      open={props.openCallDialog}
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "#00868D", // Brand Teal Color
            borderRadius: "24px",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.2)",
            padding: "0",
            width: "100%",
            maxWidth: "420px",
            margin: "16px",
            overflow: "hidden"
          },
        },
      }}
    >
      <div className="p-10 text-white relative">
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-[28px]"></i>
        </button>
        
        <h2 className="text-[32px] font-bold mb-10 text-white tracking-tight">Contact Us</h2>
        
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-teal-50/80 flex items-center gap-2 font-normal text-[16px] mb-2">
              <i className="ri-mail-send-line text-lg"></i> Send an email:
            </p>
            <div className="flex items-center gap-3">
              <a href="mailto:info@investnaija.com" className="text-white text-[18px] font-bold hover:underline">
                info@investnaija.com
              </a>
              <button 
                onClick={handleCopyEmail}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none cursor-pointer"
                title="Copy email"
              >
                <i className={copiedEmail ? "ri-check-line" : "ri-file-copy-line"}></i>
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-teal-50/80 flex items-center gap-2 font-normal text-[16px] mb-2">
              <i className="ri-phone-line text-lg"></i> Call us:
            </p>
            <div className="flex items-center gap-3">
              <a href="tel:02013301777" className="text-white text-[18px] font-bold hover:underline">
                02013301777
              </a>
              <button 
                onClick={handleCopyPhone}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none cursor-pointer"
                title="Copy phone number"
              >
                <i className={copiedPhone ? "ri-check-line" : "ri-file-copy-line"}></i>
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-teal-50/80 flex items-center gap-2 font-normal text-[16px] mb-2">
              <i className="ri-map-pin-2-line text-lg"></i> Office Address:
            </p>
            <p className="text-white text-[18px] font-bold leading-snug">
              10 Bankole Oki Street<br/>Ikoyi, Lagos, Nigeria
            </p>
          </div>
          
          <div>
            <p className="text-teal-50/80 flex items-center gap-2 font-normal text-[16px] mb-2">
              <i className="ri-time-line text-lg"></i> Opening Hours:
            </p>
            <p className="text-white text-[18px] font-bold">
              Monday - Friday<br />
              <span className="font-normal mt-1 block">9.00am - 5.00pm</span>
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
