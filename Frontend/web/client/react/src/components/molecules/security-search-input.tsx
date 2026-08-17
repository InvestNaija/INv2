interface SecuritySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Shared search field used by every securities tab (All, Gainers, Losers)
// — a pill-shaped input with a search icon and a clear (×) button, styled
// to match the app's filter/pill design language rather than the plain
// shared `Search` molecule.
const SecuritySearchInput = ({
  value,
  onChange,
  placeholder = "Search by name or symbol",
}: SecuritySearchInputProps) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-[16px] pointer-events-none">
      <i className="ri-search-line text-[18px] text-(--text-content-muted)"></i>
    </div>
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full h-[48px] pl-[44px] pr-[40px] rounded-[999px] border border-(--border-default) bg-(--surface-subtle) text-(--text-content-default) text-[14px] font-medium placeholder:text-(--text-content-muted) shadow-[0_2px_8px_rgba(15,15,15,0.04)] outline-none focus:border-[#00585E] focus:bg-(--surface-default) transition-colors"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute inset-y-0 right-0 flex items-center pr-[14px] text-(--text-content-muted) hover:text-(--text-content-default) cursor-pointer"
      >
        <i className="ri-close-circle-fill text-[18px]"></i>
      </button>
    )}
  </div>
);

export default SecuritySearchInput;
