import axios, { AxiosInstance } from "axios";
import { injectable } from "inversify";
import FormData from "form-data";
import { Exception } from "@inv2/common";
import { redisWrapper } from "../../redis.wrapper";
import {
    IMarketDataService
} from "./IMarketDataService";
import {
    ISecurity,
    ISecurityOverview,
    ISecurityDetail,
    IPortfolio,
    IBalance,
    ITradeOrder,
    IOrderTerm
} from "../../api/dtos";

@injectable()
export class ZanibalService implements IMarketDataService {
    private axiosInstance: AxiosInstance;
    private readonly REDIS_TOKEN_KEY = "ZANIBAL_ACCESS_TOKEN";

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.ZANIBAL_APPSERVER_BASE_URL,
            maxBodyLength: Infinity
        });

        // Add request interceptor to handle authentication
        this.axiosInstance.interceptors.request.use(async (config) => {
            const token = await this.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
    }

    private async getAccessToken(): Promise<string> {
        try {
            // Check Redis first (skip if test)
            if (process.env.NODE_ENV !== 'test') {
                const cachedToken = await redisWrapper.client.get(this.REDIS_TOKEN_KEY);
                if (cachedToken) {
                    return cachedToken;
                }
            }

            const data = new FormData();
            data.append('username', process.env.ZANNIBAL_USER);
            data.append('password', process.env.ZANNIBAL_PASSWORD);

            // Use static axios to avoid interceptor loop
            const response = await axios.post(`${process.env.ZANIBAL_APPSERVER_BASE_URL}/security/request/access-token`, data, {
                headers: { ...data.getHeaders() }
            });

            const token = response.data.access_token;

            // Cache in Redis (assuming 1 hour expiration for safety)
            if (process.env.NODE_ENV !== 'test') {
                await redisWrapper.client.set(this.REDIS_TOKEN_KEY, token, {
                    EX: 3600
                });
            }

            return token;
        } catch (error: any) {
            throw new Exception({ code: 500, message: "Failed to authenticate with Zanibal" });
        }
    }

    // --- Mappers ---

    private mapSecurity(sec: any): ISecurity {
        return {
            symbol: sec.symbol,
            name: sec.securityName || sec.security_name || sec.name,
            exchange: sec.marketId || sec.exchange,
            secType: sec.secType,
            secSubType: sec.secSubType
        };
    }

    private mapSecurityOverview(data: any): ISecurityOverview {
        return {
            symbol: data.symbol,
            lastPrice: data.lastPrice || data.closePrice || 0,
            change: data.change || 0,
            percentChange: data.percentChange || data.percentageChange || 0,
            open: data.openPrice || 0,
            high: data.highPrice || 0,
            low: data.lowPrice || 0,
            close: data.closePrice || 0,
            volume: data.volumeTraded || data.volume || 0,
            tradeValue: data.totalValueTraded || data.value || 0,
            timestamp: data.tradeDate || data.timestamp
        };
    }

    private mapPortfolio(p: any): IPortfolio {
        return {
            id: p.id,
            name: p.name || p.portfolioName,
            portfolioType: p.portfolioType,
            accountNumber: p.accountNumber
        };
    }

    private mapTradeOrder(o: any): ITradeOrder {
        return {
            id: o.id || o.orderId,
            portfolioId: o.portfolioId,
            symbol: o.symbol,
            side: o.orderSide || o.side,
            quantity: o.quantity,
            price: o.price,
            orderType: o.orderType,
            status: o.orderStatus || o.status,
            date: o.orderDate || o.date
        };
    }

    // --- IMarketDataService Implementation ---

    async getSecurities(exchange = 'NGX', secType = 'CS'): Promise<ISecurity[]> {
        try {
            const url = `${process.env.ZANIBAL_MDS_BASE_URL}/security/list?marketId=${exchange}&secType=${secType}`;
            const response = await this.axiosInstance.get(url);
            const data = response.data
                .filter((sec: any) => ['OTC', 'MFUND', 'ETF'].indexOf(sec.secSubType) == -1)
                .map((sec: any) => this.mapSecurity(sec));

            return data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getSecurityOverview(security: string, market = 'NGX'): Promise<ISecurityOverview> {
        try {
            const response = await this.axiosInstance.get(`${process.env.ZANIBAL_MDS_BASE_URL}/security/overview/${market}/${security}`);
            const data = this.mapSecurityOverview(response.data);
            return data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getSecurityDetail(security: string, market = 'NGX'): Promise<ISecurityDetail> {
        try {
            const response = await this.axiosInstance.get(`${process.env.ZANIBAL_MDS_BASE_URL}/security/order-book-with-chart/${market}/${security}`);
            const raw = response.data;

            const detail: ISecurityDetail = {
                overview: this.mapSecurityOverview(raw),
                orderBook: {
                    bids: (raw.bids || []).map((b: any) => ({ price: b.price, quantity: b.quantity })),
                    asks: (raw.asks || []).map((a: any) => ({ price: a.price, quantity: a.quantity }))
                }
            };

            return detail;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getCustomerPortfolio(externalId: string): Promise<IPortfolio[]> {
        try {
            const url = `/order/portfolio/customer/id/${externalId}`;
            const response = await this.axiosInstance.get(url);
            const data = response.data.result || response.data.data || response.data;
            return (Array.isArray(data) ? data : [data]).map((p: any) => this.mapPortfolio(p));
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getCustomerBalance(externalId: string, params: any = {}): Promise<any> {
        try {
            let query = "";
            if (params.startDate && params.endDate) query += `?sd=${params.startDate}&ed=${params.endDate}`;
            if (params.currency) query += (query ? "&cu=" : "?cu=") + params.currency;

            const response = await this.axiosInstance.get(`/partner/customer-valuation-for-date-range/id/${externalId}${query}`);
            return response.data.data || response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async validateTradeOrder(data: any): Promise<any> {
        try {
            const response = await this.axiosInstance.post(`/order/tradeorder/validate`, data);
            return response.data.data || response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async createTradeOrder(data: any): Promise<any> {
        try {
            const response = await this.axiosInstance.post(`/order/tradeorder/submit`, data);
            return response.data.data || response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getOrderTerms(): Promise<IOrderTerm[]> {
        try {
            const response = await this.axiosInstance.get(`/order/tradeorderterm/list/active`);
            const data = response.data.data || response.data;
            return (Array.isArray(data) ? data : [data]).map((t: any) => ({
                id: t.id,
                name: t.name,
                label: t.label || t.name
            }));
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getTopGainersLoosers(type: string, market = 'NGX', secType = 'CS'): Promise<ISecurityOverview[]> {
        try {
            const perfTypes: any = {
                pg: 'TOP_PERCENT_GAINER',
                pl: 'TOP_PERCENT_LOOSER',
                vg: 'TOP_VALUE_GAINER',
                vl: 'TOP_VALUE_LOOSER',
                ma: 'MOST_ACTIVE'
            };
            const response = await this.axiosInstance.get(`${process.env.ZANIBAL_MDS_BASE_URL}/security/performance?marketId=${market}&secType=${secType}&perfType=${perfTypes[type]}`);
            const data = (response.data.data || response.data).map((p: any) => this.mapSecurityOverview(p));
            return data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getChartData(name: string, date: string, market = 'NGX'): Promise<any[]> {
        try {
            const response = await this.axiosInstance.get(`${process.env.ZANIBAL_MDS_BASE_URL}/security/ohlcv/${market}/${name}?fieldList=d,c,v,o,h,l,a`);
            const data = response.data?.result?.filter((chart: any) => chart[0] > date) || [];
            return data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getPortfolioBalance(portfolioId: string): Promise<IBalance> {
        try {
            const response = await this.axiosInstance.get(`/partner/portfolio-valuation-for-date-range/id/${portfolioId}`);
            const data = response.data.data || response.data;
            return {
                portfolioId,
                cashBalance: data.cashBalance || 0,
                marketValue: data.marketValue || 0,
                totalValue: data.totalValue || 0
            };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getPortfolioHoldings(portfolioId: string): Promise<any[]> {
        try {
            const response = await this.axiosInstance.get(`/order/portfolio/holdings/id/${portfolioId}`);
            return response.data.data || response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getTradeOrders(portfolioId: string, params: any = {}): Promise<ITradeOrder[]> {
        try {
            let query = `?p=${portfolioId}`;
            if (params.page) query += `&b=${params.page}`;
            if (params.size) query += `&c=${params.size}`;
            if (params.orderStatus) query += `&s=${params.orderStatus}`;
            if (params.startDate) query += `&sd=${params.startDate}`;
            if (params.endDate) query += `&ed=${params.endDate}`;

            const response = await this.axiosInstance.get(`/order/tradeorder/portfolio/list${query}`);
            const data = response.data.data || response.data;
            const orders = Array.isArray(data) ? data : (data.results || []);
            return orders.map((o: any) => this.mapTradeOrder(o));
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async cancelTradeOrders(id: string): Promise<any> {
        try {
            const response = await this.axiosInstance.put(`/order/tradeorder/cancel/id/${id}`, null);
            return response.data.data || response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getPortfolioDistribution(id: string): Promise<any> {
        try {
            const response = await this.axiosInstance.get(`/research/get-sector-allocation?id=${id}&type=C&cash=true`);
            return response.data.data || response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getCustomerPurchasingPower(id: string): Promise<number> {
        try {
            const response = await this.axiosInstance.get(`/partner/customer-net-trade-balance/id/${id}`);
            const data = response.data.data || response.data;
            return data.balance || data.purchasingPower || 0;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        const message = error.response?.data?.message || error.response?.data?.msgCode || error.message;
        const status = error.response?.status || 500;
        throw new Exception({ code: status, message });
    }
}
