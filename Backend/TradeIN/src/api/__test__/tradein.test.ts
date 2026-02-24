import request from "supertest";
import { app } from "../../app";

// Mock ZanibalService methods to avoid real API calls
const mockZanibal = {
    getSecurities: jest.fn().mockResolvedValue([]),
    getSecurityOverview: jest.fn().mockResolvedValue({}),
    getSecurityDetail: jest.fn().mockResolvedValue({ overview: {}, orderBook: [] }),
    getCustomerPortfolio: jest.fn().mockResolvedValue([]),
    getPortfolioBalance: jest.fn().mockResolvedValue({}),
    getCustomerPurchasingPower: jest.fn().mockResolvedValue(1000)
};

describe('TradeIN Controller', () => {
    beforeAll(() => {
        // Rebind ZanibalService to our mock
        // container.rebind(TYPES.ZanibalService).toConstantValue(mockZanibal);
    });

    const getHeaders = () => ({
        "authorization": `Bearer ${global.getJWTAuth('CUSTOMER')}`,
    });

    describe('GET /api/v2/tradein/health - Health Check', () => {
        it('returns 200 for health check', async () => {
            const response = await request(app)
                .get('/api/v2/tradein/health')
                .expect(200);

            console.log('GET /health Response:', JSON.stringify(response.body, null, 2));
            expect(response.body.status).toBeDefined();
        }, 20000);
    });

    describe('GET /api/v2/tradein/watchlist - Watchlist', () => {
        it('returns 401 if not authenticated', async () => {
            const response = await request(app)
                .get('/api/v2/tradein/watchlist')
                .expect(401);

            console.log('GET /watchlist (401) Response:', JSON.stringify(response.body, null, 2));
        }, 20000);

        it('returns 200 and watchlist data if authenticated', async () => {
            const response = await request(app)
                .get('/api/v2/tradein/watchlist')
                .set(getHeaders())
                .expect(200);

            console.log('GET /watchlist (200) Response:', JSON.stringify(response.body, null, 2));

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        }, 20000);
    });

    describe('GET /api/v2/tradein/securities - Securities', () => {
        it('returns 200 and securities list', async () => {
            const response = await request(app)
                .get('/api/v2/tradein/securities')
                .set(getHeaders())
                .expect(200);

            console.log('GET /securities Response:', JSON.stringify(response.body, null, 2));

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        }, 20000);
    });

    describe('GET /api/v2/tradein/portfolios - Portfolios', () => {
        it('returns 200 and customer portfolios', async () => {
            const response = await request(app)
                .get('/api/v2/tradein/portfolios')
                .set(getHeaders())
                .expect(200);

            console.log('GET /portfolios Response:', JSON.stringify(response.body, null, 2));

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data[0].id).toBeDefined();
        }, 20000);
    });
});
