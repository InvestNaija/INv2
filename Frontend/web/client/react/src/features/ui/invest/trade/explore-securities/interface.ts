

export interface  SecurityListTableProps {
   image: string;
   securityName: string;
   code: string;
   // The raw secId from the trades API (e.g. "MTNN") — usually the same as
   // `code`/symbol, but kept separately so search can match against it too.
   // Optional since the mock All/Gainers/Losers data doesn't set it.
   secId?: string;
   high: number;
   low: number;
   priceChange: string;
   lastTrade: number;
}