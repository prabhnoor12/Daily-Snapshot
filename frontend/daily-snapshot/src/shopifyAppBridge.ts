import createAppBridge from '@shopify/app-bridge';

// Helper to get query param from URL
function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Get API key and shop origin from environment or URL
const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY || getQueryParam('apiKey');
const shopOrigin = getQueryParam('shop') || getQueryParam('shopOrigin');

let appBridgeInstance: ReturnType<typeof createAppBridge> | null = null;

export function getAppBridge() {
  if (!appBridgeInstance) {
    if (!apiKey || !shopOrigin) {
      throw new Error('Shopify App Bridge requires apiKey and shopOrigin');
    }
    appBridgeInstance = createAppBridge({
      apiKey,
      host: btoa(shopOrigin), // Shopify expects base64-encoded host
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

