import { Fragment } from "react";

interface OrderBookEntry {
  count: number;
  price: number;
  qty: number;
}

interface OrderBookProps {
  bids: OrderBookEntry[];
  offers: OrderBookEntry[];
}

// Renders one side (bids or offers) of the book: header row, then each
// entry's price/size/total, with a bar whose width is proportional to that
// entry's size relative to the largest size on this side.
const OrderSide = ({
  title,
  entries,
  color,
}: {
  title: string;
  entries: OrderBookEntry[];
  color: string;
}) => {
  const maxQty = Math.max(...entries.map((entry) => entry.qty), 1);
  // Cap the rendered rows so the book doesn't run off the page — deepest
  // levels rarely matter to a retail user placing a market/limit order.
  const visibleEntries = entries.slice(0, 5);

  return (
    <div className="grid xs:grid-cols-3 sm:grid-cols-3 grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      <div className="text-[14px] text-[#0F0F0F] font-semibold leading-[20px] tracking-[0.1px]">
        {title} Price (₦)
      </div>
      <div className="text-[14px] text-[#0F0F0F] font-semibold leading-[20px] tracking-[0.1px]">
        Size (Shares)
      </div>
      <div className="text-[14px] text-[#0F0F0F] font-semibold leading-[20px] tracking-[0.1px]">
        Total
      </div>

      {visibleEntries.length === 0 ? (
        <div className="col-span-3 py-[12px] text-[14px] text-(--text-content-muted)">
          No {title.toLowerCase()} orders.
        </div>
      ) : (
        visibleEntries.map((entry, index) => (
          <Fragment key={`${entry.price}-${index}`}>
            <div
              className="text-[14px] font-normal leading-[20px] tracking-[0.1px]"
              style={{ color }}
            >
              {entry.price.toLocaleString("en-US")}
            </div>
            <div className="text-[14px] text-[#0F0F0F] font-normal leading-[20px] tracking-[0.1px]">
              {entry.qty.toLocaleString("en-US")}
            </div>
            <div className="flex items-center">
              <div
                className="h-[20px] rounded-[2px]"
                style={{
                  width: `${Math.max((entry.qty / maxQty) * 100, 4)}%`,
                  backgroundColor: color,
                }}
              ></div>
            </div>
          </Fragment>
        ))
      )}
    </div>
  );
};

const OrderBook = ({ bids, offers }: OrderBookProps) => {
  return (
    <>
      <div className="mt-[12px]">
        <OrderSide title="Buy order" entries={bids} color="#44A185" />

        <div className="mt-[32px]">
          <OrderSide title="Sell order" entries={offers} color="#CC1A30" />
        </div>
      </div>
    </>
  );
};

export default OrderBook;
