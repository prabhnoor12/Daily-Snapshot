// Tests for subscription controller endpoints
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import fixtures from './fixtures/subscription_fixtures.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Hoisted mocks for prisma and shopify
const hoisted = vi.hoisted(() => ({
  mockPrisma: {
    shop: { findUnique: vi.fn() },
    subscription: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    }
  },
  mockShopifyClientPost: vi.fn()
}));
const { mockPrisma, mockShopifyClientPost } = hoisted;

// Mock prisma
vi.mock('../config/prisma.js', () => ({ default: hoisted.mockPrisma }));

// Mock shopify config: provide minimal structure with clients.Rest
vi.mock('../config/shopify.js', () => ({
  default: {
    clients: {
      Rest: class {
        constructor(opts) {
          this.session = opts.session;
        }
        post(args) {
          return mockShopifyClientPost(args);
        }
      }
    }
  }
}));

import app from '../main.js';

const {
  shopRecord,
  validCreatePayload,
  secondCreatePayload,
  invalidPayloadMissingFields,
  subscriptionDbRecord
} = fixtures;

// Attach a user with shop to each request via test-only middleware override
// main.js already sets req.user={role:'admin'} in test; we extend in tests with shop
const addShopMiddleware = (req, res, next) => { req.user.shop = shopRecord.shop; next(); };
app.use(addShopMiddleware);

describe('Subscription Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.shop.findUnique.mockReset();
    Object.values(mockPrisma.subscription).forEach(fn => fn.mockReset());
    mockShopifyClientPost.mockReset();
  });

  describe('POST /api/subscriptions createSubscription', () => {
    it('creates a subscription charge successfully', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockResolvedValue({
        body: {
          recurring_application_charge: {
            id: 9876,
            status: 'pending',
            confirmation_url: 'https://billing-confirm.example.com/9876'
          }
        }
      });
      mockPrisma.subscription.create.mockResolvedValue({ ...subscriptionDbRecord, chargeId: 9876 });
      const res = await request(app).post('/api/subscriptions').send(validCreatePayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.id).toBe(9876);
      expect(mockPrisma.subscription.create).toHaveBeenCalled();
    });
    it('returns 400 on invalid input', async () => {
      const res = await request(app).post('/api/subscriptions').send(invalidPayloadMissingFields);
      expect(res.statusCode).toBe(400);
    });
    it('returns 401 when shop session missing', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/subscriptions').send(validCreatePayload);
      expect(res.statusCode).toBe(401);
    });
    it('returns 400 when Shopify API error occurs', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockRejectedValue(new Error('API failure'));
      const res = await request(app).post('/api/subscriptions').send(validCreatePayload);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/subscriptions listSubscriptions', () => {
    it('lists subscriptions (empty)', async () => {
      mockPrisma.subscription.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/subscriptions');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
    it('lists subscriptions (some records)', async () => {
      mockPrisma.subscription.findMany.mockResolvedValue([
        { ...subscriptionDbRecord },
        { ...subscriptionDbRecord, chargeId: 2222 }
      ]);
      const res = await request(app).get('/api/subscriptions?limit=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(mockPrisma.subscription.findMany).toHaveBeenCalled();
    });
  });

  describe('POST /api/subscriptions/:chargeId/cancel cancelSubscription', () => {
    it('cancels a subscription successfully', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockResolvedValue({ body: {} });
      mockPrisma.subscription.update.mockResolvedValue({ ...subscriptionDbRecord, status: 'cancelled', cancelledAt: new Date() });
      const res = await request(app).post('/api/subscriptions/12345/cancel');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/cancelled/i);
    });
    it('returns 401 when shop session missing on cancel', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/subscriptions/12345/cancel');
      expect(res.statusCode).toBe(401);
    });
    it('returns 400 when Shopify cancel API call fails', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockRejectedValue(new Error('Cancel failed'));
      const res = await request(app).post('/api/subscriptions/9999/cancel');
      expect(res.statusCode).toBe(400);
    });
  });
});
