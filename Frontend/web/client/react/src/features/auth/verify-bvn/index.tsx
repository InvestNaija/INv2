import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/buttons";
import AuthShell from "../../../components/organisms/auth-shell";

// Placeholder step — BVN verification isn't wired to a real endpoint yet,
// so this just holds the wizard's place (step 2 of 3) and lets the
// customer skip straight to the dashboard like every other step here.
export default function VerifyBvn() {
  const navigate = useNavigate();

  return (
    <AuthShell step={2} totalSteps={3} onSkip={() => navigate("/app")}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-[16px]">
        <span className="text-[26px] leading-none">🪪</span>
        <p className="mt-[10px] text-[16px] font-bold text-white">BVN Verification</p>
        <p className="mt-[2px] text-[13px] text-white/60">
          Confirm your identity security
        </p>
      </div>

      <p className="mt-[20px] text-center text-[13px] text-white/50">
        This step isn't ready yet — skip it for now and finish it later from
        Settings.
      </p>

      <Button
        type="button"
        variant="primary"
        onClick={() => navigate("/app")}
        className="rounded-[99px] h-[56px] mt-[24px] !bg-[#B8F0E8] hover:!bg-[#A5E9DE] !text-[#04181B] font-bold"
      >
        Skip to dashboard
      </Button>
    </AuthShell>
  );
}
