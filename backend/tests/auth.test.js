global.APP_UNINSTALLED = 'APP_UNINSTALLED';
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authFixtures from './fixtures/auth_fixtures.js';
import authRouter from '../routes/authRoute.js';

process.env.HOST = 'https://testhost';
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', authRouter);

function getCookies(res) {
  const cookies = {};
  (res.headers['set-cookie'] || []).forEach(cookieStr => {
    const [cookie] = cookieStr.split(';');
    const [name, value] = cookie.split('=');
    cookies[name.trim()] = value.trim();
  });
  return cookies;
}

const { validUser, signupPayload, loginPayload, invalidLoginPayload } = authFixtures;

vi.mock('../config/shopify.js', () => ({
  default: {
    auth: {
      begin: vi.fn(async ({ shop }) => `https://${shop}/auth`),
      callback: vi.fn(async ({ rawRequest }) => ({
        shop: rawRequest.query.shop,
        accessToken: 'mockToken',
        id: 'mockSessionId',
        isOnline: false,
        state: rawRequest.query.state,
        scope: 'read_products',
        expires: null,
        host: rawRequest.query.host || 'mockhost'
      })),
    },
    clients: {
      Graphql: class {
        constructor({ session }) {
          this.session = session;
        }
        query = vi.fn(async () => ({
          body: {
            data: {
              webhookSubscriptionCreate: {
                userErrors: [],
                webhookSubscription: { id: 'mockWebhookId' }
              }
            }
          }
        }));
      }
    }
  }
}));

describe('Auth Controller Endpoints', () => {
  it('should start offline auth flow and set state cookie', async () => {
    const shop = 'testshop.myshopify.com';
    const res = await request(app)
      .get(`/api/auth?shop=${shop}`)
      .expect(302);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers.location).toContain(shop);
  });

  it('should start online auth flow and set state cookie', async () => {
    const shop = 'testshop.myshopify.com';
    const res = await request(app)
      .get(`/api/auth/online?shop=${shop}`)
      .expect(302);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers.location).toContain(shop);
  });

  it('should fail auth flow with invalid shop domain', async () => {
    const res = await request(app)
      .get('/api/auth?shop=invalidshop.com')
      .expect(400);
    expect(res.body.message).toMatch(/Invalid shop domain/);
  });

  it('should handle auth callback and redirect to frontend', async () => {
    const shop = 'testshop.myshopify.com';
    const state = 'mockstate';
    const res = await request(app)
      .get(`/api/auth/callback?shop=${shop}&state=${state}&host=mockhost`)
      .set('Cookie', [`shopify_oauth_state=${state}`])
      .expect(302);
    expect(res.headers.location).toContain(`/?shop=${shop}`);
  });

  it('should logout and clear sessions', async () => {
    const shop = validUser.email;
    const res = await request(app)
      .get(`/api/logout?shop=${shop}`)
      .expect(200);
    expect(res.body.message).toMatch(/Logged out successfully/);
  });
});
