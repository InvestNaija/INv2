export interface IPortfolio {
    id: string;
    name: string;
    portfolioType: string;
    accountNumber: string;
}

export interface IBalance {
    portfolioId: string;
    cashBalance: number;
    marketValue: number;
    totalValue: number;
    purchasingPower?: number;
}

export interface IPortfolioHolding {
    symbol: string;
    quantity: number;
    costBasis: number;
    marketPrice: number;
    marketValue: number;
    gainLoss: number;
    percentGainLoss: number;
}

export interface IPortfolioDistribution {
    sector: string;
    allocation: number;
}
