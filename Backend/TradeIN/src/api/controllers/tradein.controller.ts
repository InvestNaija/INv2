import { controller, httpGet, httpPost, httpDelete } from "inversify-express-utils";
import { NextFunction, Request, Response } from "express";
import { Exception, CustomError, Authentication, INLogger } from "@inv2/common";
import { TradeINService } from "../../business/services";
import {
    ISecurity,
    ISecurityOverview,
    IPortfolio,
    ITradeOrder,
    CreateOrderDto
} from "../dtos";

@controller("/tradein")
export class TradeINController {
    constructor(private readonly tradeinSvc: TradeINService) { }

    @httpGet("/health")
    public async healthz(req: Request, res: Response, next: NextFunction): Promise<void> {
        res.status(200).json({ status: "TradeIN Service is healthy" });
    }

    @httpGet("/watchlist", Authentication.requireAuth)
    public async getWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const response = await this.tradeinSvc.getWatchlist(currentUser.user.id);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Watchlist successful for user ${currentUser.user.id}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpPost("/watchlist", Authentication.requireAuth)
    public async addToWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const { symbol } = req.body;
            if (!symbol) throw new Exception({ code: 400, message: "Symbol is required" });

            const response = await this.tradeinSvc.addToWatchlist(String(currentUser.user.id), symbol);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Added ${symbol} to watchlist for user ${currentUser.user.id}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpDelete("/watchlist/:symbol", Authentication.requireAuth)
    public async removeFromWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const symbol = req.params.symbol;

            const response = await this.tradeinSvc.removeFromWatchlist(String(currentUser.user.id), symbol);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Removed ${symbol} from watchlist for user ${currentUser.user.id}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpGet("/recommended")
    public async getRecommended(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const response = await this.tradeinSvc.getRecommendedSecurities();
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Recommended securities successful` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/securities")
    public async getSecurities(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const { exchange, secType } = req.query;
            const response = await this.tradeinSvc.getSecurities(exchange as string, secType as string);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Securities successful` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/details/:symbol")
    public async getSecurityDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const response = await this.tradeinSvc.getSecurityDetail(req.params.symbol);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Security Detail successful for ${req.params.symbol}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/performance")
    public async getPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const { type } = req.query;
            const response = await this.tradeinSvc.getTopGainersLoosers(type as string);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Performance (${type}) successful` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/portfolios", Authentication.requireAuth)
    public async getPortfolios(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const response = await this.tradeinSvc.getCustomerPortfolios(String(currentUser.user.id));
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Portfolios successful for user ${currentUser.user.id}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/portfolios/:portfolioId", Authentication.requireAuth)
    public async getPortfolioBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const response = await this.tradeinSvc.getPortfolioBalance(req.params.portfolioId, String(currentUser.user.id));
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Portfolio Balance successful for ${req.params.portfolioId}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/portfolios/:portfolioId/holdings", Authentication.requireAuth)
    public async getPortfolioHoldings(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const response = await this.tradeinSvc.getPortfolioHoldings(req.params.portfolioId);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Portfolio Holdings successful for ${req.params.portfolioId}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/portfolios/:portfolioId/history", Authentication.requireAuth)
    public async getTradeHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const response = await this.tradeinSvc.getTradeHistory(req.params.portfolioId, req.query);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Trade History successful for ${req.params.portfolioId}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpPost("/orders/validate", Authentication.requireAuth)
    public async validateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const body: CreateOrderDto = req.body;
            const response = await this.tradeinSvc.validateTradeOrder(body);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Validate Order successful` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpPost("/orders", Authentication.requireAuth)
    public async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const body: CreateOrderDto = req.body;
            const response = await this.tradeinSvc.createTradeOrder(body);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Create Order successful` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpDelete("/orders/:orderId", Authentication.requireAuth)
    public async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const response = await this.tradeinSvc.cancelTradeOrder(req.params.orderId);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Cancel Order successful for ${req.params.orderId}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/charts")
    public async getCharts(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const { name, date } = req.query;
            const response = await this.tradeinSvc.getChartData(name as string, date as string);
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Charts successful for ${name}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/terms")
    public async getTerms(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const response = await this.tradeinSvc.getOrderTerms();
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Order Terms successful` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    @httpGet("/distribution", Authentication.requireAuth)
    public async getDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const response = await this.tradeinSvc.getPortfolioDistribution(String(currentUser.user.id));
            res.status(response.code).json(response);
            profiler.done({ service: `TradeIN`, message: `Get Distribution successful for user ${currentUser.user.id}` });
        } catch (error) {
            next(this.handleControllerError(error));
        }
    }

    private handleControllerError(error: any): Exception {
        if (error instanceof CustomError) return error as any;
        return new Exception({ code: 500, message: "An unexpected error occurred" });
    }
}
