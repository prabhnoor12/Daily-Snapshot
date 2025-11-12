import { shopifyApi } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { PrismaSessionStorage } from './prisma_session_storage.js';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  apiVersion: '2023-10', // Explicitly set required Shopify API version
  isEmbeddedApp: true,
  sessionStorage: new PrismaSessionStorage(),
});

export default shopify;
