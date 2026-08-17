import Tooltip from "@mui/material/Tooltip";

interface MarketStatisticsProps {
  open: number;
  prevClose: number;
  bestBidPx: number;
  symbol: string;
  high: number;
  low: number;
  bestOfferPx: number;
}

const formatNaira = (value: number) =>
  `₦${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatCell = ({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) => (
  <div>
    <div className="flex items-center gap-[4px] text-[13px] text-(--text-content-subtle) font-semibold">
      <span>{label}</span>
      <Tooltip title={description} arrow placement="top">
        <i className="ri-information-line text-[13px] cursor-pointer"></i>
      </Tooltip>
    </div>
    <div className="mt-[4px] text-[15px] text-(--text-content-default) font-semibold">
      {value}
    </div>
  </div>
);

// 52Wk High/Low aren't returned by the security overview endpoint, so they're
// shown as ₦0.00 (same gap the reference design shows).
const MarketStatistics = ({
  open,
  prevClose,
  bestBidPx,
  symbol,
  high,
  low,
  bestOfferPx,
}: MarketStatisticsProps) => {
  return (
    <div className="mt-[12px] grid grid-cols-3 gap-y-[20px] sm:w-[100%] xs:w-[100%] w-[100%] md:w-[552px] lg:w-[552px] xl:w-[552px]">
      <StatCell
        label="Open"
        value={formatNaira(open)}
        description="The price this security opened at when today's trading session began."
      />
      <StatCell
        label="Prev Close"
        value={formatNaira(prevClose)}
        description="The closing price from the previous trading session."
      />
      <StatCell
        label="Best Bid"
        value={formatNaira(bestBidPx)}
        description="The highest price a buyer is currently willing to pay."
      />
      <StatCell
        label="Symbol"
        value={symbol}
        description="The ticker symbol used to identify this security on the exchange."
      />
      <StatCell
        label="High"
        value={formatNaira(high)}
        description="The highest price this security has traded at today."
      />
      <StatCell
        label="Low"
        value={formatNaira(low)}
        description="The lowest price this security has traded at today."
      />
      <StatCell
        label="Best Offer"
        value={formatNaira(bestOfferPx)}
        description="The lowest price a seller is currently willing to accept."
      />
      <StatCell
        label="52Wk High"
        value="₦0.00"
        description="The highest price this security has traded at over the past 52 weeks."
      />
      <StatCell
        label="52Wk Low"
        value="₦0.00"
        description="The lowest price this security has traded at over the past 52 weeks."
      />
    </div>
  );
};

export default MarketStatistics;
