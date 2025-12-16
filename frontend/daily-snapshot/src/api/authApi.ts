
import { shopifyFetch, shopifyFetchJson } from './shopifyFetch';

const API_BASE = 'https://daily-snapshot-1.onrender.com/api/auth';

export async function initiateShopifyOAuth(shopDomain: string): Promise<string> {
  const url = new URL(`${API_BASE}/shopify/initiate`);
  url.searchParams.set('shop_domain', shopDomain);
  const response = await shopifyFetch(url.toString(), { method: 'GET', credentials: 'include' });
  // Try to get redirect URL from response/request
  const data = await response.json().catch(() => ({}));
  return response.url || data?.redirect_url;
}

export async function handleShopifyOAuthCallback(params: Record<string, string>): Promise<any> {
  const url = new URL(`${API_BASE}/shopify/callback`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await shopifyFetch(url.toString(), { method: 'GET', credentials: 'include' });
  return response.json();
}
