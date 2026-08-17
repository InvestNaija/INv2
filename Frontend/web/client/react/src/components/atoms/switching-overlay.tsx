// Full-screen, blurred-backdrop overlay shown while a profile switch
// (parent <-> minor) is in flight — covers the whole viewport (not just the
// dialog it was triggered from) since the switch affects the entire app,
// not just whatever component happened to kick it off.
const SwitchingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-[16px] bg-white/60 backdrop-blur-md">
    <div className="h-[36px] w-[36px] animate-spin rounded-full border-[3px] border-[#00868D]/20 border-t-[#00868D]"></div>
    <p className="text-[14px] font-semibold text-(--text-content-default)">{message}</p>
  </div>
);

export default SwitchingOverlay;
