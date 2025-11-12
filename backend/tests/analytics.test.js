import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Hoisted mocks for Prisma and Shopify GraphQL client
const hoisted = vi.hoisted(() => ({
	mockPrisma: { shop: { findUnique: vi.fn() } },
	mockShopifyClientQuery: vi.fn()
}));
const { mockPrisma, mockShopifyClientQuery } = hoisted;

vi.mock('../config/prisma.js', () => ({ default: hoisted.mockPrisma }));
vi.mock('../config/shopify.js', () => ({
	default: {
		clients: {
			Graphql: class { constructor(opts){ this.session = opts.session; } query(args){ return hoisted.mockShopifyClientQuery(args); } }
		}
	}
}));

// Import after mocks
import analyticsRouter from '../routes/analyticsRoute.js';
import { __clearAnalyticsCache } from '../controllers/analytics_controler.js';
import { errorHandler } from '../middleware/error_handling.js';

// Fixtures
import analyticsFixtures from './fixtures/analytics_fixtures.js';
const { buildOrdersGraphQLResponse, todayOrders, yesterdayOrders, mixedOrders, PROD_A } = analyticsFixtures;

// Helper to build a tiny test app mounting only analytics endpoints with a test user
function buildTestApp() {
	const app = express();
	app.use(express.json());
	app.use((req, _res, next) => {
		// Inject a test user with a shop and id
		req.user = { id: 'u-test', shop: 'test.myshopify.com' };
		next();
	});
	app.use('/api/analytics', analyticsRouter);
	app.use(errorHandler); // to catch thrown errors (e.g., BadRequest)
	return app;
}

describe('Analytics Controller Endpoints', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPrisma.shop.findUnique.mockReset();
		mockShopifyClientQuery.mockReset();
		// Default: shop session exists
		mockPrisma.shop.findUnique.mockResolvedValue({ shop: 'test.myshopify.com', accessToken: 'shpca_test' });
	});

	describe('GET /snapshot', () => {
		it('returns daily snapshot with calculated metrics', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(todayOrders));
			const res = await request(app).get('/api/analytics/snapshot');
			expect(res.statusCode).toBe(200);
			expect(res.body?.data).toBeDefined();
			const data = res.body.data;
			expect(typeof data.sales).toBe('number');
			expect(data.orders).toBe(2);
			expect(typeof data.aov).toBe('number');
			expect(data.topProduct?.id).toBe(PROD_A);
		});

		it('caches result for 60 seconds (second call avoids Shopify)', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(todayOrders));
			const r1 = await request(app).get('/api/analytics/snapshot');
			expect(r1.statusCode).toBe(200);
			const callsAfterFirst = mockShopifyClientQuery.mock.calls.length;
			const r2 = await request(app).get('/api/analytics/snapshot');
			expect(r2.statusCode).toBe(200);
			// Should not have added a new Shopify call on the second request
			expect(mockShopifyClientQuery.mock.calls.length).toBe(callsAfterFirst);
		});

		it('returns 502 when Shopify query fails', async () => {
			// Ensure cache is cleared so we don't hit a previous snapshot cache
			__clearAnalyticsCache();
			const app = buildTestApp();
			mockShopifyClientQuery.mockRejectedValue(new Error('Shopify down'));
			const res = await request(app).get('/api/analytics/snapshot');
			expect(res.statusCode).toBe(502);
			expect(res.body?.message || res.body?.error).toMatch(/failed to fetch orders/i);
		});
	});

	describe('GET /trend', () => {
		it('returns 7-day trend array', async () => {
			const app = buildTestApp();
			// For simplicity, always return the same day dataset; shape is what we verify
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(todayOrders));
			const res = await request(app).get('/api/analytics/trend');
			expect(res.statusCode).toBe(200);
			const trend = res.body.data;
			expect(Array.isArray(trend)).toBe(true);
			expect(trend.length).toBe(7);
			expect(trend[0]).toHaveProperty('date');
			expect(trend[0]).toHaveProperty('sales');
			expect(trend[0]).toHaveProperty('orders');
			expect(trend[0]).toHaveProperty('aov');
			expect(trend[0]).toHaveProperty('topProduct');
		});
	});

	describe('GET /compare', () => {
		it('compares today vs yesterday metrics', async () => {
			const app = buildTestApp();
			// Order of calls: today then yesterday
			mockShopifyClientQuery
				.mockResolvedValueOnce(buildOrdersGraphQLResponse(todayOrders))
				.mockResolvedValueOnce(buildOrdersGraphQLResponse(yesterdayOrders));
			const res = await request(app).get('/api/analytics/compare');
			expect(res.statusCode).toBe(200);
			const data = res.body.data;
			expect(data).toHaveProperty('sales');
			expect(data).toHaveProperty('orders');
			expect(data).toHaveProperty('aov');
			// Ensure change is a string percentage or null
			expect(['string', 'object']).toContain(typeof data.sales.change);
		});
	});

	describe('GET /range', () => {
		it('rejects when start or end is missing', async () => {
			const app = buildTestApp();
			const res = await request(app).get('/api/analytics/range');
			expect(res.statusCode).toBe(400);
			expect((res.body.message || '').toLowerCase()).toMatch(/missing start or end/i);
		});

		it('returns metrics and topProducts for date range', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(mixedOrders));
			const res = await request(app).get('/api/analytics/range')
				.query({ start: '2025-11-01', end: '2025-11-02' });
			expect(res.statusCode).toBe(200);
			const data = res.body.data;
			expect(data).toHaveProperty('sales');
			expect(data).toHaveProperty('orders');
			expect(data).toHaveProperty('aov');
			expect(Array.isArray(data.topProducts)).toBe(true);
			expect(data.topProducts.length).toBeGreaterThan(0);
		});
	});

	describe('GET /products/top', () => {
		it('returns top N products for today', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(todayOrders));
			const res = await request(app).get('/api/analytics/products/top').query({ limit: 1 });
			expect(res.statusCode).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
			expect(res.body.data.length).toBe(1);
			expect(res.body.data[0].id).toBe(PROD_A);
		});
	});

	describe('GET /orders/status', () => {
		it('returns order financial and fulfillment status counts', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(mixedOrders));
			const res = await request(app).get('/api/analytics/orders/status');
			expect(res.statusCode).toBe(200);
			const counts = res.body.data;
			// Expect keys like PENDING, PAID, FULFILLED, UNFULFILLED
			expect(Object.keys(counts).length).toBeGreaterThan(0);
			expect(counts.PAID ?? counts.PENDING ?? 0).toBeGreaterThanOrEqual(0);
		});
	});

	describe('GET /customers/insights', () => {
		it('returns new and returning customers summary', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(todayOrders));
			const res = await request(app).get('/api/analytics/customers/insights');
			expect(res.statusCode).toBe(200);
			expect(res.body.data).toHaveProperty('newCustomers');
			expect(res.body.data).toHaveProperty('returningCustomers');
		});
	});

	describe('GET /export', () => {
		it('returns JSON export by default', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(todayOrders));
			const res = await request(app).get('/api/analytics/export');
			expect(res.statusCode).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
			expect(res.body.data[0]).toHaveProperty('id');
			expect(res.body.data[0]).toHaveProperty('totalPrice');
			expect(res.body.data[0]).toHaveProperty('createdAt');
		});

		it('returns CSV export when requested', async () => {
			const app = buildTestApp();
			mockShopifyClientQuery.mockResolvedValue(buildOrdersGraphQLResponse(todayOrders));
			const res = await request(app).get('/api/analytics/export').query({ format: 'csv' });
			expect(res.statusCode).toBe(200);
			expect((res.headers['content-type'] || '').toLowerCase()).toContain('text/csv');
			// json2csv outputs quoted headers by default, accept either quoted or bare
			expect(res.text).toMatch(/"?id"?,\s*"?totalPrice"?,\s*"?createdAt"?/i);
		});
	});
});
