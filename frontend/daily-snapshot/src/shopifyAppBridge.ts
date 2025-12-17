import createAppBridge from '@shopify/app-bridge';

// Helper to get query param from URL
function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}


// Get API key from environment and host from Shopify's query param
const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
let host = getQueryParam('host');
// Fallback for local development if host is not in URL
if (!host) {
  host = 'sanacut.myshopify.com';
}

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.error('VITE_SHOPIFY_API_KEY is not set. Please add it to your .env file.');
}


let appBridgeInstance: ReturnType<typeof createAppBridge> | null = null;

// Factory function to get or create the App Bridge instance
export function getAppBridge() {
  if (!appBridgeInstance) {
    if (!apiKey || !host) {
      throw new Error('Shopify App Bridge requires apiKey and host');
    }
    appBridgeInstance = createAppBridge({
      apiKey,
      host, // already base64 encoded by Shopify
      forceRedirect: true,
    });
  }
  return appBridgeInstance;
}


// Optionally, export a Vue plugin for provide/inject usage
import type { App } from 'vue';
export const ShopifyAppBridgePlugin = {
  install(app: App) {
    app.provide('appBridge', getAppBridge());
  },
};

