

import { shopifyFetch, shopifyFetchJson } from './shopifyFetch';


const API_BASE = 'https://daily-snapshot-1.onrender.com/forecasting';

// --- Sales Forecast Endpoints ---
export async function getSalesForecast(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/forecast`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getSalesExpSmoothing(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/exp_smoothing`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getSalesArima(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/arima`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getSalesTrend(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/trend`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getSalesChart(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/chart`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getSalesWarnings(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/warnings`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getSalesSummary(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/summary`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getSalesRecommendation(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/recommendation`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function exportSales(shopId: string, format: string, segment?: string) {
  const url = new URL(`${API_BASE}/sales/${shopId}/export`);
  url.searchParams.set('format', format);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetch(url.toString(), { method: 'GET' });
}

// --- Orders Forecast Endpoints ---
export async function getOrdersForecast(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/forecast`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getOrdersExpSmoothing(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/exp_smoothing`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getOrdersArima(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/arima`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getOrdersTrend(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/trend`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getOrdersChart(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/chart`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getOrdersWarnings(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/warnings`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getOrdersSummary(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/summary`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function getOrdersRecommendation(shopId: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/recommendation`);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetchJson(url.toString());
}

export async function exportOrders(shopId: string, format: string, segment?: string) {
  const url = new URL(`${API_BASE}/orders/${shopId}/export`);
  url.searchParams.set('format', format);
  if (segment) url.searchParams.set('segment', segment);
  return shopifyFetch(url.toString(), { method: 'GET' });
}

