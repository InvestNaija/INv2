import { Dialog, type DialogProps } from "@mui/material";
import { useState } from "react";
import OtpInput from "react-otp-input";
import Button from "../atoms/buttons";

const OTP_LENGTH = 6;

interface OtpVerificationProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
  // The address the code was sent to — shown masked (e.g. "ra***@gmail.com")
  // so the customer can confirm it's the right inbox without exposing the
  // full address on screen. Omit entirely for non-email codes (e.g. an
  // authenticator-app TOTP code) — the masked-email line just won't render.
  email?: string;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
  isResending?: boolean;
  onSubmit: (otp: string) => void;
  onResend?: () => void;
}

// Hides the middle of the local part: "rauyhghhbjbjb@gmail.com" ->
// "ra***********@gmail.com".
const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - visible.length, 3))}@${domain}`;
};

// Generic OTP-entry modal — takes an `onSubmit(otp)` callback rather than
// owning any request logic itself, so any flow that needs a "confirm with a
// code we emailed you" step (wallet withdrawal today, others later) can
// reuse it without duplicating the OTP-input UI.
const OtpVerification = ({
  openDialog,
  setDialog,
  email,
  title = "Verify it's you",
  description = "We sent a 6 digit code to your email",
  isSubmitting = false,
  isResending = false,
  onSubmit,
  onResend,
}: OtpVerificationProps) => {
  const [otp, setOtp] = useState("");

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      setDialog(false);
    }
  };

  const handleSubmit = () => {
    if (otp.length !== OTP_LENGTH || isSubmitting) return;
    onSubmit(otp);
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      slotProps={{
        // Clears any previously-entered code as the dialog starts opening,
        // so a stale/failed code from a prior attempt isn't silently
        // resubmitted — done here (a transition event) rather than in a
        // render-phase effect, since this is a response to the dialog
        // opening, not state synchronization.
        transition: { onEnter: () => setOtp("") },
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(15, 15, 15, 0.45)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "var(--surface-default)",
            borderRadius: { xs: "20px", sm: "24px" },
            width: "440px",
            maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
            maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
            margin: { xs: "12px", sm: "32px" },
            overflowY: "auto",
            padding: { xs: "24px 16px", sm: "34px 24px" },
          },
        },
      }}
    >
      <div>
        <div className="flex justify-end">
          <span
            className="text-(--text-content-default) cursor-pointer bg-(--surface-subtle) border border-(--border-default) rounded-[999px] px-[9px] py-[6px] transition-transform active:scale-90"
            onClick={() => setDialog(false)}
          >
            <i className="ri-close-fill text-[24px] leading-[28px]"></i>
          </span>
        </div>

        <div className="mt-[12px] text-center">
          <h2 className="text-[22px] sm:text-[28px] font-semibold text-(--text-content-default) leading-[30px] sm:leading-[40px] tracking-[-0.3px]">
            {title}
          </h2>
          <p className="mt-[8px] text-(--text-content-muted) text-[13px] sm:text-[14px] leading-[19px] sm:leading-[20px] font-medium">
            {description}
          </p>
          {email && (
            <p className="text-(--text-content-default) text-[13px] sm:text-[14px] leading-[19px] sm:leading-[20px] font-semibold break-all">
              {maskEmail(email)}
            </p>
          )}
        </div>

        <div className="mt-[32px] sm:mt-[40px] flex justify-center">
          <OtpInput
            containerStyle="flex gap-[6px] sm:gap-[12px] justify-center"
            // The library defaults each input to an inline `width: 1em`,
            // which (being inline) beats the responsive Tailwind width
            // classes below — skipDefaultStyles turns that off so our
            // classes are actually the ones controlling box size.
            skipDefaultStyles
            inputStyle={{
              border: "2px solid #DCDCDC",
              borderRadius: "16px",
              fontWeight: 800,
              background: "var(--surface-subtle)",
              color: "var(--text-content-default)",
            }}
            value={otp}
            onChange={setOtp}
            numInputs={OTP_LENGTH}
            shouldAutoFocus
            placeholder="••••••"
            renderInput={(inputProps) => (
              <input
                {...inputProps}
                className="w-[42px] h-[50px] text-[20px] sm:w-[56px] sm:h-[64px] sm:text-[28px] text-center transition-all duration-150 outline-none focus:!border-[#00585E] focus:!bg-white focus:shadow-[0_0_0_4px_rgba(0,88,94,0.15)]"
              />
            )}
          />
        </div>

        {onResend && (
          <div className="mt-[20px] text-center">
            <span className="text-(--text-content-muted) text-[13px] font-medium">
              Didn't get a code?{" "}
            </span>
            <a
              onClick={() => !isResending && onResend()}
              className={`text-(--text-content-system) text-[13px] font-semibold ${
                isResending ? "opacity-50" : "cursor-pointer hover:underline"
              }`}
            >
              {isResending ? "Resending…" : "Resend code"}
            </a>
          </div>
        )}

        <div className="mt-[32px]">
          <Button
            variant="primary"
            disabled={otp.length !== OTP_LENGTH || isSubmitting}
            isLoading={isSubmitting}
            className="rounded-[99px] h-[56px] transition-transform active:scale-[0.98]"
            onClick={handleSubmit}
          >
            Continue
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default OtpVerification;
