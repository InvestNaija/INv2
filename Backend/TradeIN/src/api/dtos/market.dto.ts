export interface ISecurity {
    symbol: string;
    name: string;
    exchange: string;
    secType: string;
    secSubType: string;
}

export interface ISecurityOverview {
    symbol: string;
    lastPrice: number;
    change: number;
    percentChange: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    tradeValue: number;
    timestamp: string;
}

export interface IPricePoint {
    price: number;
    quantity: number;
}

export interface IOrderBook {
    bids: IPricePoint[];
    asks: IPricePoint[];
}

export interface ISecurityDetail {
    overview: ISecurityOverview;
    orderBook: IOrderBook;
}
