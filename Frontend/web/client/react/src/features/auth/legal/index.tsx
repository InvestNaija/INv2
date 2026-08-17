import { useNavigate, useParams } from "react-router-dom";
import Back from "../../../components/molecules/back";
import AppLogo from "../../../assets/icons/investnaija-full-logo.svg";
import LegalContent from "./legal-content";
import termsOfUseContent from "./terms-of-use-content";
import privacyPolicyContent from "./privacy-policy-content";
import riskDisclosureContent from "./risk-disclosure-content";
import planinSaveinDisclaimerContent from "./planin-savein-disclaimer-content";

interface LegalTab {
  slug: string;
  label: string;
  content: string | null;
}

const TABS: LegalTab[] = [
  { slug: "terms_of_use", label: "Terms of Use", content: termsOfUseContent },
  { slug: "privacy_policy", label: "Privacy Policy", content: privacyPolicyContent },
  { slug: "risk_disclosure", label: "Risk Disclosure", content: riskDisclosureContent },
  {
    slug: "planin_savein_disclaimer",
    label: "PlanIN and SaveIN Disclaimer",
    content: planinSaveinDisclaimerContent,
  },
];

const LAST_UPDATED = "August 2026";

const Legal = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  const activeTab = TABS.find((t) => t.slug === tab) ?? TABS[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-[20px] py-[20px] sm:px-[48px] sm:py-[28px] lg:px-[80px]">
        <Back name="Back" />
        <img src={AppLogo} alt="InvestNaija" className="h-[32px] sm:h-[40px]" />
      </div>

      {/* Heading */}
      <div className="mt-[8px] sm:mt-[16px] text-center">
        <h1 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.5px] text-[#0B2540]">
          Legal
        </h1>
      </div>

      <div className="mx-auto mt-[32px] sm:mt-[40px] max-w-[860px] px-[16px] sm:px-[24px] pb-[80px]">
        {/* Last updated */}
        <div className="flex justify-end">
          <span className="text-[12px] font-medium uppercase tracking-[0.4px] text-[#94A3B8]">
            Updated {LAST_UPDATED}
          </span>
        </div>

        {/* Modern segmented tab switcher — scrolls horizontally on mobile
            instead of wrapping/overflowing (same pattern used across the
            app's other tab strips). */}
        <div className="relative mt-[12px] max-w-full">
          <div className="flex max-w-full gap-[6px] overflow-x-auto rounded-[999px] bg-[#F1F5F9] p-[6px]">
            {TABS.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => navigate(`/auth/legal/${t.slug}`)}
                className={`shrink-0 whitespace-nowrap rounded-[999px] px-[16px] py-[10px] text-[13px] sm:text-[14px] font-semibold transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                  activeTab.slug === t.slug
                    ? "bg-[#0B2540] text-white shadow-[0_4px_12px_rgba(11,37,64,0.25)]"
                    : "text-[#64748B] hover:text-[#0B2540] hover:bg-white/70"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div className="mt-[28px] sm:mt-[36px] rounded-[24px] border border-[#F1F5F9] bg-white p-[20px] sm:p-[36px] shadow-[0_2px_24px_rgba(15,23,42,0.04)]">
          {activeTab.content ? (
            <LegalContent content={activeTab.content} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[64px] text-center">
              <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F1F5F9]">
                <i className="ri-file-text-line text-[22px] text-[#94A3B8]"></i>
              </span>
              <p className="text-[14px] font-medium text-[#94A3B8]">
                {activeTab.label} content is coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Legal;
