// Frontend Shopify OAuth helpers (moved under src to avoid dev proxy collisions)
import axios from 'axios';


// Use Vite proxy for local dev, fallback to production for build
const API_BASE = import.meta.env.VITE_API_AUTH_BASE || '/api/auth';

export async function initiateShopifyOAuth(shopDomain: string): Promise<string> {
  const response = await axios.get(`${API_BASE}/shopify/initiate`, {
    params: { shop_domain: shopDomain },
    withCredentials: true,
  });
  return response.request?.responseURL || response.data?.redirect_url;
}

export async function handleShopifyOAuthCallback(params: Record<string, string>): Promise<any> {
  const response = await axios.get(`${API_BASE}/shopify/callback`, {
    params,
    withCredentials: true,
  });
  return response.data;
}
