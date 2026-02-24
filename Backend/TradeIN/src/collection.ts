import { Collection } from 'postman-collection';
import * as fs from 'fs';
import {
    TradeInHealthCheck,
    WatchlistRequests,
    SecuritiesRequests,
    PortfolioRequests,
    OrderRequests
} from "./collections/tradein/tradein";

// This is the postman collection
const postmanCollection = new Collection({
    info: {
        name: 'INv2 - TradeIN Microservice',
        description: {
            content: 'API collection for the INv2 Trading and Market Data microservice.\n\n## Base URL\n- Local: `http://localhost:3012/api/v2/tradein`\n- Production: Update the `baseUrl` variable accordingly\n\n## Authentication\nMost endpoints require a JWT token. Get your token from the Auth service and set it in the `accessToken` variable.',
            type: 'text/markdown'
        }
    },
    variable: [
        {
            key: "baseUrl",
            value: "http://localhost:3012/api/v2/tradein",
            type: "string"
        },
        {
            key: "accessToken",
            value: "",
            type: "string",
            description: "JWT token obtained from the Auth service"
        },
        {
            key: "symbol",
            value: "NGX:MTNN",
            type: "string",
            description: "Security symbol for testing"
        },
        {
            key: "portfolioId",
            value: "",
            type: "string",
            description: "Portfolio ID for testing"
        },
        {
            key: "orderId",
            value: "",
            type: "string",
            description: "Order ID for testing"
        }
    ],
    // Requests in this collection
    item: [
        {
            name: "Health Check",
            item: [
                TradeInHealthCheck.item()
            ]
        },
        {
            name: "Watchlist",
            item: [
                WatchlistRequests.getWatchlist(),
                WatchlistRequests.addToWatchlist(),
                WatchlistRequests.removeFromWatchlist("{{symbol}}")
            ]
        },
        {
            name: "Market Data (Securities)",
            item: [
                SecuritiesRequests.getSecurities(),
                SecuritiesRequests.getRecommended(),
                SecuritiesRequests.getSecurityDetail("{{symbol}}"),
                SecuritiesRequests.getPerformance("topGainers"),
                SecuritiesRequests.getPerformance("topLosers"),
                SecuritiesRequests.getCharts("{{symbol}}")
            ]
        },
        {
            name: "Portfolios",
            item: [
                PortfolioRequests.getPortfolios(),
                PortfolioRequests.getPortfolioBalance("{{portfolioId}}"),
                PortfolioRequests.getPortfolioHoldings("{{portfolioId}}"),
                PortfolioRequests.getTradeHistory("{{portfolioId}}"),
                PortfolioRequests.getDistribution()
            ]
        },
        {
            name: "Orders",
            item: [
                OrderRequests.validateOrder(),
                OrderRequests.createOrder(),
                OrderRequests.cancelOrder("{{orderId}}"),
                OrderRequests.getTerms()
            ]
        }
    ],
});

// Convert the collection to JSON so that it can be exported to a file
const collectionJSON = postmanCollection.toJSON();
// Create a collection.json file. It can be imported to postman
fs.writeFile('./INv2-TradeIN.postman_collection.json', JSON.stringify(collectionJSON, null, 2), (err) => {
    if (err) {
        console.error('Error writing collection file:', err);
        return;
    }
    console.log('Postman collection file saved: INv2-TradeIN.postman_collection.json');
});
