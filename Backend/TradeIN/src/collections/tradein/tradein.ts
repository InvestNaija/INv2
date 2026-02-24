import { Item } from 'postman-collection';

export class TradeInHealthCheck {
    static item() {
        return new Item({
            name: `TradeIN Health Check`,
            description: `Check if the TradeIN service is running and healthy.`,
            request: {
                header: [],
                url: "{{baseUrl}}/health",
                method: 'GET',
            },
        });
    }
}

export class WatchlistRequests {
    static getWatchlist() {
        return new Item({
            name: `Get Watchlist`,
            description: `Retrieve the user's saved securities.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/watchlist",
                method: 'GET',
            },
        });
    }

    static addToWatchlist(symbol: string = "NGX:MTNN") {
        return new Item({
            name: `Add to Watchlist`,
            description: `Add a security to the user's watchlist.`,
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/watchlist",
                method: 'POST',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({ symbol }, null, 2),
                },
            },
        });
    }

    static removeFromWatchlist(symbol: string = "NGX:MTNN") {
        return new Item({
            name: `Remove from Watchlist`,
            description: `Remove a security from the user's watchlist.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/watchlist/${symbol}`,
                method: 'DELETE',
            },
        });
    }
}

export class SecuritiesRequests {
    static getRecommended() {
        return new Item({
            name: `Get Recommended Securities`,
            description: `Get a list of recommended securities.`,
            request: {
                header: [],
                url: "{{baseUrl}}/recommended",
                method: 'GET',
            },
        });
    }

    static getSecurities(exchange = "NGX", secType = "CS") {
        return new Item({
            name: `Get All Securities`,
            description: `Get a list of all securities for a given exchange and type.`,
            request: {
                header: [],
                url: `{{baseUrl}}/securities?exchange=${exchange}&secType=${secType}`,
                method: 'GET',
            },
        });
    }

    static getSecurityDetail(symbol = "NGX:MTNN") {
        return new Item({
            name: `Get Security Detail`,
            description: `Get real-time details, order book, and chart data for a security.`,
            request: {
                header: [],
                url: `{{baseUrl}}/details/${symbol}`,
                method: 'GET',
            },
        });
    }

    static getPerformance(type = "topGainers") {
        return new Item({
            name: `Get Market Performance`,
            description: `Get top gainers or losers. Type can be 'topGainers' or 'topLosers'.`,
            request: {
                header: [],
                url: `{{baseUrl}}/performance?type=${type}`,
                method: 'GET',
            },
        });
    }

    static getCharts(name = "NGX:MTNN", date = "") {
        return new Item({
            name: `Get Chart Data`,
            description: `Get OHLCV chart data for a security.`,
            request: {
                header: [],
                url: `{{baseUrl}}/charts?name=${name}&date=${date}`,
                method: 'GET',
            },
        });
    }
}

export class PortfolioRequests {
    static getPortfolios() {
        return new Item({
            name: `Get Customer Portfolios`,
            description: `Get all trade portfolios for the authenticated user.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/portfolios",
                method: 'GET',
            },
        });
    }

    static getPortfolioBalance(portfolioId = "{{portfolioId}}") {
        return new Item({
            name: `Get Portfolio Balance`,
            description: `Get the cash balance and details of a specific portfolio.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/portfolios/${portfolioId}`,
                method: 'GET',
            },
        });
    }

    static getPortfolioHoldings(portfolioId = "{{portfolioId}}") {
        return new Item({
            name: `Get Portfolio Holdings`,
            description: `Get the security holdings for a specific portfolio.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/portfolios/${portfolioId}/holdings`,
                method: 'GET',
            },
        });
    }

    static getTradeHistory(portfolioId = "{{portfolioId}}") {
        return new Item({
            name: `Get Trade History`,
            description: `Get the history of trade orders for a specific portfolio.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/portfolios/${portfolioId}/history`,
                method: 'GET',
            },
        });
    }

    static getDistribution() {
        return new Item({
            name: `Get Portfolio Distribution`,
            description: `Get the distribution of assets across all portfolios.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/distribution",
                method: 'GET',
            },
        });
    }
}

export class OrderRequests {
    static validateOrder() {
        return new Item({
            name: `Validate Trade Order`,
            description: `Validate a trade order before submission (checks balance, limits, etc.).`,
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/orders/validate",
                method: 'POST',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        portfolioId: "{{portfolioId}}",
                        symbol: "NGX:MTNN",
                        orderType: "BUY",
                        quantity: 100,
                        price: 250.50,
                        term: "GTS"
                    }, null, 2),
                },
            },
        });
    }

    static createOrder() {
        return new Item({
            name: `Place Trade Order`,
            description: `Submit a buy or sell trade order.`,
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/orders",
                method: 'POST',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        portfolioId: "{{portfolioId}}",
                        symbol: "NGX:MTNN",
                        orderType: "BUY",
                        quantity: 100,
                        price: 250.50,
                        term: "GTS"
                    }, null, 2),
                },
            },
        });
    }

    static cancelOrder(orderId = "{{orderId}}") {
        return new Item({
            name: `Cancel Trade Order`,
            description: `Cancel an existing trade order if it hasn't been fully executed.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/orders/${orderId}`,
                method: 'DELETE',
            },
        });
    }

    static getTerms() {
        return new Item({
            name: `Get Order Terms`,
            description: `Get valid duration terms for trade orders (e.g., GTS, GFD).`,
            request: {
                header: [],
                url: "{{baseUrl}}/terms",
                method: 'GET',
            },
        });
    }
}
