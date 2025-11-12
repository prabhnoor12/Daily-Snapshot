// Unit tests for SubscriptionService (without HTTP layer)
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fixtures from './fixtures/subscription_fixtures.js';

process.env.NODE_ENV = 'test';

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

vi.mock('../config/prisma.js', () => ({ default: hoisted.mockPrisma }));
vi.mock('../config/shopify.js', () => ({
  default: {
    clients: {
      Rest: class { constructor(opts){ this.session = opts.session; } post(args){ return mockShopifyClientPost(args); } }
    }
  }
}));

import * as SubscriptionService from '../services/SubscriptionService.js';

const { shopRecord, validCreatePayload, subscriptionDbRecord } = fixtures;

describe('SubscriptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.shop.findUnique.mockReset();
    Object.values(mockPrisma.subscription).forEach(fn => fn.mockReset());
    mockShopifyClientPost.mockReset();
  });

  describe('createSubscription', () => {
    it('creates subscription via Shopify and persists', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockResolvedValue({ body: { recurring_application_charge: { id: 777, status: 'pending', confirmation_url: 'https://c.example/777' } } });
      mockPrisma.subscription.create.mockResolvedValue({ ...subscriptionDbRecord, chargeId: 777 });
      const charge = await SubscriptionService.createSubscription(shopRecord.shop, validCreatePayload);
      expect(charge.id).toBe(777);
      expect(mockPrisma.subscription.create).toHaveBeenCalled();
    });
    it('throws on missing shop session', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(null);
      await expect(SubscriptionService.createSubscription(shopRecord.shop, validCreatePayload)).rejects.toThrow(/session/i);
    });
    it('throws on Shopify API failure', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockRejectedValue(new Error('fail'));
      await expect(SubscriptionService.createSubscription(shopRecord.shop, validCreatePayload)).rejects.toThrow(/Shopify API error/i);
    });
  });

  describe('listSubscriptions', () => {
    it('returns array from prisma', async () => {
      mockPrisma.subscription.findMany.mockResolvedValue([ subscriptionDbRecord ]);
      const list = await SubscriptionService.listSubscriptions(shopRecord.shop, 10, 0);
      expect(list).toHaveLength(1);
    });
  });

  describe('cancelSubscription', () => {
    it('cancels subscription successfully', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockResolvedValue({ body: {} });
      mockPrisma.subscription.update.mockResolvedValue({ ...subscriptionDbRecord, status: 'cancelled', cancelledAt: new Date() });
      const msg = await SubscriptionService.cancelSubscription(shopRecord.shop, subscriptionDbRecord.chargeId);
      expect(msg).toMatch(/cancelled/i);
    });
    it('throws when Shopify cancel API fails', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(shopRecord);
      mockShopifyClientPost.mockRejectedValue(new Error('cancel fail'));
      await expect(SubscriptionService.cancelSubscription(shopRecord.shop, subscriptionDbRecord.chargeId)).rejects.toThrow(/Shopify API error/i);
    });
  });
});
