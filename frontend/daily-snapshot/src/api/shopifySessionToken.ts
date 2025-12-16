import { getAppBridge } from '../shopifyAppBridge';
import { getSessionToken } from '@shopify/app-bridge-utils';

/**
 * Get a valid Shopify session token from App Bridge.
 */
export async function getShopifySessionToken(): Promise<string> {
  const appBridge = getAppBridge();
  return getSessionToken(appBridge);
}

/**
 * Helper to get Authorization header with session token
 */
export async function getShopifyAuthHeader(): Promise<{ [key: string]: string }> {
  const token = await getShopifySessionToken();
  return { Authorization: `Bearer ${token}` };
}
