export interface ITradeOrder {
    id: string;
    portfolioId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    orderType: string;
    status: string;
    date: string;
}

export interface IOrderTerm {
    id: string;
    name: string;
    label: string;
}

export interface CreateOrderDto {
    portfolioId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price?: number;
    orderType: string;
    termId: string;
}

export interface ValidateOrderDto extends CreateOrderDto { }
