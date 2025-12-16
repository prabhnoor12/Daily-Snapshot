
import { getShopifyAuthHeader } from './shopifySessionToken';


/**
 * Wrapper for fetch that attaches Shopify session token in Authorization header.
 * Usage: shopifyFetch(url, options)
 */
export async function shopifyFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const authHeader = await getShopifyAuthHeader();
  const mergedInit: RequestInit = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...authHeader,
    },
  };
  return fetch(input, mergedInit);
}


/**
 * Helper to fetch JSON responses easily
 */
export async function shopifyFetchJson<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await shopifyFetch(input, init);
  if (!response.ok) throw new Error(`Shopify fetch failed: ${response.status}`);
  return response.json();
}
