import { IResponse } from "@inv2/common";
import {
    ISecurity,
    ISecurityOverview,
    ISecurityDetail,
    IPortfolio,
    IBalance,
    ITradeOrder,
    IOrderTerm
} from "../../api/dtos";

export interface IMarketDataService {
    getSecurities(exchange?: string, secType?: string): Promise<ISecurity[]>;
    getSecurityOverview(security: string, market?: string): Promise<ISecurityOverview>;
    getSecurityDetail(security: string, market?: string): Promise<ISecurityDetail>;
    getCustomerPortfolio(externalId: string): Promise<IPortfolio[]>;
    getCustomerBalance(externalId: string, params?: any): Promise<any>; // Keep any for complex balance params for now
    validateTradeOrder(data: any): Promise<any>;
    createTradeOrder(data: any): Promise<any>;
    getOrderTerms(): Promise<IOrderTerm[]>;
    getTopGainersLoosers(type: string, market?: string, secType?: string): Promise<ISecurityOverview[]>;
    getChartData(name: string, date: string, market?: string): Promise<any[]>;
    getPortfolioBalance(portfolioId: string): Promise<IBalance>;
    getPortfolioHoldings(portfolioId: string): Promise<any[]>;
    getTradeOrders(portfolioId: string, params?: any): Promise<ITradeOrder[]>;
    cancelTradeOrders(id: string): Promise<any>;
    getPortfolioDistribution(id: string): Promise<any>;
    getCustomerPurchasingPower(id: string): Promise<number>;
}
