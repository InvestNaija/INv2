interface SecurityTrade {
  lastPx: number;
  tradeSize: number;
  tradePx: number;
  volume: number;
  time: string;
  mdEntryID: string;
  secId: string | null;
}

interface TransactionsProps {
  trades: SecurityTrade[];
  secDesc: string;
}

const formatTradeTime = (time: string) =>
  new Date(time).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const Transactions = ({ trades, secDesc }: TransactionsProps) => {
  if (trades.length === 0) {
    return (
      <div className="mt-[12px] py-[24px] text-center text-[14px] text-(--text-content-muted)">
        No recent trades to show.
      </div>
    );
  }

  return (
    <>
      <div className="mt-[12px] sm:w-[100%] xs:w-[100%] w-[100%] md:w-[552px] lg:w-[552px] xl:w-[552px]">
        {trades.map((trade, index) => (
          <div
            key={trade.mdEntryID ?? index}
            className="flex justify-between items-center py-[12px]"
          >
            <div className="flex gap-2">
              <div>
                <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#F5F5F5] text-[#0f0f0f]">
                  <i className="ri-exchange-line text-[24px]"></i>
                </span>
              </div>
              <div className="flex flex-col">
                <div>
                  <span className="text-[#0F0F0F] font-normal text-[14px] leading-[20px] tracking-[0.1px]">
                    {trade.tradeSize.toLocaleString("en-US")} units of{" "}
                    {secDesc}
                  </span>
                </div>
                <div>
                  <span className="text-[#BFBFBF] font-medium text-[12px] leading-[20px] tracking-[0.1px]">
                    Trade • {formatTradeTime(trade.time)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-[#0F0F0F] font-medium text-[14px] leading-[20px] tracking-[0.1px]">
                ₦
                {trade.lastPx.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Transactions;
