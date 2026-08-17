import { useNavigate } from "react-router-dom";

const PREVIEW_FORMATS = [
  { icon: "ri-article-line", label: "Articles" },
  { icon: "ri-play-circle-line", label: "Videos" },
  { icon: "ri-mic-line", label: "Podcasts" },
  { icon: "ri-graduation-cap-line", label: "Courses" },
] as const;

// Learn isn't a real feature yet (the previous version of this page was
// entirely hardcoded placeholder content — fake podcast/article entries) —
// this replaces that with an honest "coming soon" state instead of
// pretending it's live.
const LearnDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-[20px] py-[48px] text-center">
      {/* Soft ambient glow behind the hero icon — same device used on the
          additional-kyc "You're all set!" screen, reused here for the same
          "something considered, not just empty" feel. */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#00868D]/10 to-[#E77731]/10 blur-[80px]"></div>

      <div className="relative">
        <div className="relative flex h-[104px] w-[104px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#00585E] to-[#00868D] shadow-[0_20px_48px_rgba(0,88,94,0.28)]">
          <i className="ri-book-read-line text-[44px] text-white"></i>
          <span className="absolute -top-[6px] -right-[6px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.1)] ring-4 ring-white">
            <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-gradient-to-br from-[#FF9B5E] to-[#E77731]">
              <i className="ri-sparkling-2-fill text-[13px] text-white"></i>
            </span>
          </span>
        </div>
      </div>

      <span className="relative mt-[28px] inline-flex items-center gap-[6px] rounded-full bg-[#F4F4F4] px-[14px] py-[6px] text-[11px] font-bold uppercase tracking-[0.6px] text-[#5A5A5A]">
        <i className="ri-time-line text-[13px]"></i>
        Coming soon
      </span>

      <h1 className="relative mt-[16px] max-w-[420px] text-[26px] sm:text-[32px] font-bold leading-[34px] sm:leading-[40px] tracking-[-0.4px] text-(--text-content-default)">
        We're building your investing education hub
      </h1>
      <p className="relative mt-[10px] max-w-[440px] text-[14px] sm:text-[15px] leading-[22px] text-(--text-content-subtle)">
        Bite-sized articles, videos and podcasts to help you understand markets,
        grow your money and invest with confidence — all in one place, soon.
      </p>

      <div className="relative mt-[32px] flex flex-wrap items-center justify-center gap-[10px]">
        {PREVIEW_FORMATS.map((format) => (
          <div
            key={format.label}
            className="flex items-center gap-[8px] rounded-full border border-[#F0F0F0] bg-white px-[16px] py-[10px] shadow-[0_4px_14px_rgba(15,15,15,0.04)]"
          >
            <i className={`${format.icon} text-[16px] text-[#00868D]`}></i>
            <span className="text-[13px] font-semibold text-(--text-content-default)">{format.label}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate("/app/home")}
        className="relative mt-[36px] flex items-center gap-[8px] rounded-[99px] bg-gradient-to-r from-[#00585E] to-[#00868D] px-[28px] py-[14px] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(0,88,94,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_32px_rgba(0,88,94,0.32)] active:scale-[0.98] cursor-pointer"
      >
        Back to dashboard
        <i className="ri-arrow-right-line text-[16px]"></i>
      </button>
    </div>
  );
};

export default LearnDashboard;
