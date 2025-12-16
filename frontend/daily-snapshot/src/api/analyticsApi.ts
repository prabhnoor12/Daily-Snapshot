
import { shopifyFetch, shopifyFetchJson } from './shopifyFetch';

// Use Vite proxy for local dev, fallback to production for build
const API_BASE = import.meta.env.VITE_API_ANALYTICS_BASE || '/analytics';

export async function getDayOverDayPerformance(shopId: number) {
  return shopifyFetchJson(`${API_BASE}/day-over-day/${shopId}`);
}

export async function get7DayTrendCharts(shopId: number) {
  return shopifyFetchJson(`${API_BASE}/7-day-trends/${shopId}`);
}

export async function getTopProductsOfDay(shopId: number, topN: number = 3) {
  const url = new URL(`${API_BASE}/top-products/${shopId}`);
  url.searchParams.set('top_n', String(topN));
  return shopifyFetchJson(url.toString());
}

export async function getOrderStatusBreakdown(shopId: number) {
  return shopifyFetchJson(`${API_BASE}/order-status/${shopId}`);
}

export async function getRealTimeVisitorCount(shopId: number) {
  return shopifyFetchJson(`${API_BASE}/real-time-visitors/${shopId}`);
}

export async function getAverageOrderValue(shopId: number) {
  return shopifyFetchJson(`${API_BASE}/aov/${shopId}`);
}

export async function exportDailySnapshot(shopId: number, format: string = 'csv') {
  const url = new URL(`${API_BASE}/export/${shopId}`);
  url.searchParams.set('format', format);
  return shopifyFetch(url.toString(), { method: 'GET' });
}

export async function getCustomizableDashboardMetrics(shopId: number, selectedMetrics: string[] = []) {
  return shopifyFetchJson(`${API_BASE}/custom-dashboard/${shopId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected_metrics: selectedMetrics }),
  });
}

export async function checkBasicAlerts(shopId: number, salesGoal: number = 1000, inventoryThreshold: number = 10) {
  const url = new URL(`${API_BASE}/alerts/${shopId}`);
  url.searchParams.set('sales_goal', String(salesGoal));
  url.searchParams.set('inventory_threshold', String(inventoryThreshold));
  return shopifyFetchJson(url.toString());
}

export async function getMobileDashboardData(shopId: number) {
  return shopifyFetchJson(`${API_BASE}/mobile-dashboard/${shopId}`);
}
