import React, { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import Button from "../atoms/buttons";

interface DirectTransferGatewayProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  fixedAmount: number;
  currency: string;
  isSubmitting: boolean;
  onContinue: (payload: { paymentMethod: string; receiptFile: File }) => void;
}

const DirectTransferGateway: React.FC<DirectTransferGatewayProps> = ({
  open,
  setOpen,
  title,
  fixedAmount,
  currency,
  isSubmitting,
  onContinue,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (!isSubmitting) setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onContinue({
        paymentMethod: "direct_transfer",
        receiptFile: selectedFile,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(0px)", opacity: "0.5" },
        },
        paper: {
          sx: {
            backgroundColor: "var(--surface-default, #FFFFFF)",
            borderRadius: "24px",
            width: { xs: "100%", sm: "500px" },
            maxWidth: "calc(100% - 32px)",
            margin: { xs: "16px", sm: "32px" },
            padding: { xs: "32px 20px", sm: "40px 32px" },
          },
        },
      }}
    >
      <div className="flex items-center justify-between mb-[32px]">
        <h3 className="text-[20px] font-bold text-[#0F0F0F]">{title}</h3>
        <button
          onClick={handleClose}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#FAFAFA] text-[#0F0F0F] hover:bg-[#F0F0F0] transition-colors"
          disabled={isSubmitting}
        >
          <i className="ri-close-line text-[20px]"></i>
        </button>
      </div>

      <div className="bg-[#F8FAFC] rounded-[16px] p-[24px] mb-[32px] border border-[#F0F4F8]">
        <p className="text-[14px] text-[#5A5A5A] mb-[16px] font-medium leading-[22px]">
          Please transfer exactly <span className="font-bold text-[#00585E]">{currency === "USD" ? "$" : "₦"}{fixedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> to the bank account below, then upload your payment receipt to complete the investment.
        </p>
        
        <div className="flex flex-col gap-[12px]">
          <div className="flex justify-between items-center py-[12px] border-b border-[#EAF0F2]">
            <span className="text-[#8C8C8C] text-[13px] font-medium">Bank Name</span>
            <span className="text-[#0F0F0F] text-[14px] font-bold">InvestNaija USD Bank</span>
          </div>
          <div className="flex justify-between items-center py-[12px] border-b border-[#EAF0F2]">
            <span className="text-[#8C8C8C] text-[13px] font-medium">Account Name</span>
            <span className="text-[#0F0F0F] text-[14px] font-bold">InvestNaija LLC</span>
          </div>
          <div className="flex justify-between items-center py-[12px]">
            <span className="text-[#8C8C8C] text-[13px] font-medium">Account Number</span>
            <span className="text-[#0F0F0F] text-[14px] font-bold">1234567890</span>
          </div>
        </div>
      </div>

      <div 
        className={`border-2 border-dashed rounded-[16px] p-[32px] flex flex-col items-center justify-center transition-colors cursor-pointer mb-[32px] ${
          selectedFile ? 'border-[#00585E] bg-[#F3FAFA]' : 'border-[#DCDCDC] hover:border-[#00585E] bg-[#FAFAFA]'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,.pdf" 
          onChange={handleFileChange} 
        />
        <div className="w-[48px] h-[48px] rounded-full bg-[#EBF4F5] flex items-center justify-center mb-[16px]">
          <i className={`text-[24px] text-[#00585E] ${selectedFile ? 'ri-file-check-line' : 'ri-upload-cloud-2-line'}`}></i>
        </div>
        
        {selectedFile ? (
          <>
            <p className="text-[16px] font-bold text-[#0F0F0F] mb-[4px]">{selectedFile.name}</p>
            <p className="text-[13px] text-[#5A5A5A]">Click or drag to replace receipt</p>
          </>
        ) : (
          <>
            <p className="text-[16px] font-bold text-[#0F0F0F] mb-[4px]">Upload Payment Receipt</p>
            <p className="text-[13px] text-[#5A5A5A]">JPEG, PNG, or PDF up to 5MB</p>
          </>
        )}
      </div>

      <Button
        variant="primary"
        className="w-full h-[56px] rounded-[12px]"
        disabled={!selectedFile || isSubmitting}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        I have made the transfer
      </Button>
    </Dialog>
  );
};

export default DirectTransferGateway;
