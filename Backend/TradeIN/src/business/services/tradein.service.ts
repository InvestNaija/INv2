import { inject, injectable, interfaces } from "inversify";
import { IResponse, Exception, CustomError } from "@inv2/common";
import { ValidationError, DatabaseError } from "sequelize";
import { TYPES } from "../types";
import { ISecurityRepository } from "../repositories";
import { IMarketDataService } from "./IMarketDataService";
import {
    ISecurity,
    ISecurityOverview,
    ISecurityDetail,
    IPortfolio,
    IBalance,
    ITradeOrder,
    IOrderTerm,
    CreateOrderDto
} from "../../api/dtos";

import { ITradeInProfileRepository } from "../repositories/ITradeInProfileRepository";

@injectable()
export class TradeINService {
    constructor(
        @inject(TYPES.ISecurityRepository)
        private readonly securityRepo: ISecurityRepository,
        @inject(TYPES.IMarketDataServiceFactory)
        private readonly marketDataSvcFactory: interfaces.Factory<IMarketDataService>,
        @inject(TYPES.ActiveTradeProvider)
        private readonly activeProvider: string,
        @inject(TYPES.ITradeInProfileRepository)
        private readonly tradeInProfileRepo: ITradeInProfileRepository
    ) { }

    private get marketDataSvc(): IMarketDataService {
        return (this.marketDataSvcFactory as any)(this.activeProvider);
    }

    private async getExternalId(userId: string): Promise<string> {
        const profile = await this.tradeInProfileRepo.getProfileByUserIdAndProvider(userId, this.activeProvider);
        if (!profile || !profile.externalId) {
            throw new Exception({ code: 400, message: "User profiling processing" });
        }
        return profile.externalId;
    }

    async getWatchlist(userId: any): Promise<IResponse> {
        try {
            const watchlist = await this.securityRepo.getWatchlist(userId);
            const promises = watchlist.map(async (item: any) => {
                const [overview, detail] = await Promise.all([
                    this.marketDataSvc.getSecurityOverview(item.symbol),
                    this.marketDataSvc.getSecurityDetail(item.symbol)
                ]);
                return { ...item.toJSON(), ...overview, ...detail.overview };
            });
            const data = await Promise.all(promises);
            return { success: true, code: 200, message: "Watchlist retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async addToWatchlist(userId: string, symbol: string): Promise<IResponse> {
        try {
            // Check if already in watchlist
            const existing = await this.securityRepo.getSecurityBySymbolAndCustomer(symbol, userId);
            if (existing) {
                return { success: true, code: 200, message: "Security already in watchlist", data: existing };
            }

            const created = await this.securityRepo.createSecurity({
                customerId: userId,
                symbol,
                watchlist: true
            });
            return { success: true, code: 201, message: "Added to watchlist successfully", data: created };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async removeFromWatchlist(userId: string, symbol: string): Promise<IResponse> {
        try {
            await this.securityRepo.deleteFromWatchlist(symbol, userId);
            return { success: true, code: 200, message: "Removed from watchlist successfully" };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getSecurities(exchange?: string, secType?: string): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.getSecurities(exchange, secType);
            return { success: true, code: 200, message: "Securities retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getSecurityDetail(symbol: string): Promise<IResponse> {
        try {
            const [overview, detail] = await Promise.all([
                this.marketDataSvc.getSecurityOverview(symbol),
                this.marketDataSvc.getSecurityDetail(symbol)
            ]);
            return { success: true, code: 200, message: "Security details retrieved successfully", data: { ...overview, ...detail.overview, orderBook: detail.orderBook } };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getTopGainersLoosers(type: string): Promise<IResponse> {
        try {
            const result = await this.marketDataSvc.getTopGainersLoosers(type);
            const promises = result.map(async (security: any) => {
                const overview = await this.marketDataSvc.getSecurityOverview(security.symbol);
                return { ...security, ...overview };
            });
            const data = await Promise.all(promises);
            return { success: true, code: 200, message: "Top gainers/losers retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getRecommendedSecurities(): Promise<IResponse> {
        try {
            const recommended = await this.securityRepo.getRecommended();
            const promises = recommended.map(async (security: any) => {
                const [overview, detail] = await Promise.all([
                    this.marketDataSvc.getSecurityOverview(security.symbol),
                    this.marketDataSvc.getSecurityDetail(security.symbol)
                ]);
                return { ...detail.overview, ...overview, order: security.order };
            });
            const data = await Promise.all(promises);
            return { success: true, code: 200, message: "Recommended securities retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getCustomerPortfolios(userId: string): Promise<IResponse> {
        try {
            const externalId = await this.getExternalId(userId);
            const portfolios = await this.marketDataSvc.getCustomerPortfolio(externalId);
            const data = portfolios.filter((p: any) => p.portfolioType !== 'TREASURY');
            return { success: true, code: 200, message: "Customer portfolios retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getPortfolioBalance(portfolioId: string, userId: string): Promise<IResponse> {
        try {
            const externalId = await this.getExternalId(userId);
            const [balance, purchasingPower] = await Promise.all([
                this.marketDataSvc.getPortfolioBalance(portfolioId),
                this.marketDataSvc.getCustomerPurchasingPower(externalId)
            ]);
            const data = { ...balance, purchasingPower };
            return { success: true, code: 200, message: "Portfolio balance retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getPortfolioHoldings(portfolioId: string): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.getPortfolioHoldings(portfolioId);
            return { success: true, code: 200, message: "Portfolio holdings retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getTradeHistory(portfolioId: string, params: any): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.getTradeOrders(portfolioId, params);
            return { success: true, code: 200, message: "Trade history retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async validateTradeOrder(orderData: CreateOrderDto): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.validateTradeOrder(orderData);
            return { success: true, code: 200, message: "Trade order validated successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async createTradeOrder(orderData: CreateOrderDto): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.createTradeOrder(orderData);
            return { success: true, code: 200, message: "Trade order created successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async cancelTradeOrder(orderId: string): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.cancelTradeOrders(orderId);
            return { success: true, code: 200, message: "Trade order cancelled successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getChartData(name: string, date: string): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.getChartData(name, date);
            return { success: true, code: 200, message: "Chart data retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getOrderTerms(): Promise<IResponse> {
        try {
            const data = await this.marketDataSvc.getOrderTerms();
            return { success: true, code: 200, message: "Order terms retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getPortfolioDistribution(userId: string): Promise<IResponse> {
        try {
            const externalId = await this.getExternalId(userId);
            const data = await this.marketDataSvc.getPortfolioDistribution(externalId);
            return { success: true, code: 200, message: "Portfolio distribution retrieved successfully", data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    private handleError(error: any): IResponse {
        if (error instanceof CustomError) throw new Exception(error);
        if (error instanceof ValidationError) {
            return { code: 400, message: error.errors.map((e: any) => e.message).join(", "), success: false };
        }
        if (error instanceof DatabaseError) {
            return { code: 500, message: "Database error occurred", success: false };
        }
        return { code: 500, message: "An unknown error occurred", success: false };
    }
}
