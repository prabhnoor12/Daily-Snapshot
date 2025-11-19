// Shopify OAuth API for frontend
import axios from 'axios';

const API_BASE = '/api/auth'; // Adjust if your backend prefix differs

export async function initiateShopifyOAuth(shopDomain: string): Promise<string> {
  // Initiates OAuth flow, returns redirect URL
  const response = await axios.get(`${API_BASE}/shopify/initiate`, {
    params: { shop_domain: shopDomain },
    withCredentials: true,
  });
  // Backend responds with a redirect, so you may need to handle window.location
  return response.request.responseURL || response.data?.redirect_url;
}

export async function handleShopifyOAuthCallback(params: Record<string, string>): Promise<any> {
  // Handles OAuth callback, expects params: shop, code, state, hmac
  const response = await axios.get(`${API_BASE}/shopify/callback`, {
    params,
    withCredentials: true,
  });
  return response.data;
}

// Example usage in a Vue component:
// import { initiateShopifyOAuth, handleShopifyOAuthCallback } from '../api/authApi';
// await initiateShopifyOAuth('yourshop.myshopify.com');
// await handleShopifyOAuthCallback({ shop, code, state, hmac });
