interface EmptyStateIconProps {
  size?: number;
  icon?: string;
}

// Lightweight replacement for the old Coin.svg empty-state image (a huge
// embedded asset) — a plain RemixIcon glyph in a soft circle, matching the
// pattern already used by AssetsList's own EmptyState.
const EmptyStateIcon = ({ size = 56, icon = "ri-inbox-2-line" }: EmptyStateIconProps) => (
  <span
    className="inline-flex items-center justify-center rounded-full bg-[#F5F5F5]"
    style={{ height: size, width: size }}
  >
    <i className={`${icon} text-[#BFBFBF]`} style={{ fontSize: Math.round(size * 0.45) }}></i>
  </span>
);

export default EmptyStateIcon;
