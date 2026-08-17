import { useEffect, useRef, useState, type ComponentType } from "react";
import { getCountryCallingCode, type Country } from "react-phone-number-input";

interface CountryOption {
  value?: Country;
  label: string;
  divider?: boolean;
}

interface FlagIconProps {
  country?: Country;
  label?: string;
}

// The exact prop shape react-phone-number-input passes to a custom
// `countrySelectComponent` (see PhoneInputWithCountry.js: value, options,
// onChange, disabled, readOnly, iconComponent — this fully replaces the
// library's own <select>-based picker, so this component owns the whole
// flag + dropdown widget, not just the list).
interface SearchableCountrySelectProps {
  value?: Country;
  options: CountryOption[];
  onChange: (value: Country | undefined) => void;
  disabled?: boolean;
  readOnly?: boolean;
  iconComponent: ComponentType<FlagIconProps>;
  theme?: "dark" | "light";
}

// Dark-themed replacement for the library's native <select> country picker
// — same flag icons and country list it already has, but as a proper
// dropdown panel with a search box, since a native <select> can't be
// searched and renders inconsistently across browsers/OS.
const SearchableCountrySelect = ({
  value,
  options,
  onChange,
  disabled,
  iconComponent: Icon,
  theme = "dark",
}: SearchableCountrySelectProps) => {
  const isLight = theme === "light";
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  const selected = options.find((option) => !option.divider && option.value === value);

  const countryOptions = options.filter(
    (option): option is CountryOption & { value: Country } => !option.divider && Boolean(option.value),
  );

  const filtered = countryOptions.filter((option) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      option.label.toLowerCase().includes(q) ||
      option.value.toLowerCase().includes(q) ||
      getCountryCallingCode(option.value).includes(q.replace(/^\+/, ""))
    );
  });

  return (
    <div className="PhoneInputCountry relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className="flex cursor-pointer items-center gap-[6px] disabled:cursor-not-allowed"
      >
        {selected?.value && <Icon country={selected.value} label={selected.label} />}
        <i
          className={`ri-arrow-down-s-line text-[14px] transition-transform duration-150 ${isOpen ? "rotate-180" : ""} ${isLight ? "text-[#9B9B9B]" : "text-white/60"}`}
        ></i>
      </button>

      {isOpen && (
        <div className={`absolute left-0 top-[calc(100%+10px)] z-50 w-[280px] overflow-hidden rounded-2xl border ${
          isLight ? "border-[#EBEBEB] bg-white shadow-[0_16px_40px_rgba(15,15,15,0.12)]" : "border-white/10 bg-[#0A3236] shadow-2xl"
        }`}>
          <div className={`border-b p-[10px] ${isLight ? "border-[#EBEBEB]" : "border-white/10"}`}>
            <div className={`flex items-center gap-2 rounded-xl px-3 py-[8px] ${isLight ? "bg-[#F5F5F5]" : "bg-white/10"}`}>
              <i className={`ri-search-line text-[14px] ${isLight ? "text-[#9B9B9B]" : "text-white/50"}`}></i>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country or code"
                className={`w-full bg-transparent text-[13px] outline-none ${
                  isLight ? "text-[#222] placeholder:text-[#9B9B9B]" : "text-white placeholder-white/40"
                }`}
              />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-[6px]">
            {filtered.length === 0 ? (
              <div className={`px-4 py-[24px] text-center text-[13px] ${isLight ? "text-[#9B9B9B]" : "text-white/40"}`}>
                No countries found
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 px-4 py-[10px] text-left transition-colors ${
                    isLight
                      ? option.value === value ? "bg-[#F0FAFB]" : "hover:bg-[#F5F5F5]"
                      : option.value === value ? "bg-white/10" : "hover:bg-white/10"
                  }`}
                >
                  <Icon country={option.value} label={option.label} />
                  <span className={`flex-1 truncate text-[13px] ${isLight ? "text-[#222]" : "text-white"}`}>{option.label}</span>
                  <span className={`text-[12px] ${isLight ? "text-[#9B9B9B]" : "text-white/40"}`}>+{getCountryCallingCode(option.value)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableCountrySelect;
