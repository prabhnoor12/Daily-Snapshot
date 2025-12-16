// Alias for compatibility with Dashboard.vue
export const getDashboard = getBenchmarkDashboard;

import { shopifyFetch, shopifyFetchJson } from './shopifyFetch';

const API_BASE = 'https://daily-snapshot-1.onrender.com/benchmarking';

export async function getBenchmarkMetrics(shopId: string) {
  const url = `${API_BASE}/${shopId}/metrics`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkTrends(shopId: string) {
  const url = `${API_BASE}/${shopId}/trends`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkCorrelation(shopId: string) {
  const url = `${API_BASE}/${shopId}/correlation`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkSegmentation(shopId: string) {
  const url = `${API_BASE}/${shopId}/segmentation`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkWarnings(shopId: string) {
  const url = `${API_BASE}/${shopId}/warnings`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkMilestones(shopId: string) {
  const url = `${API_BASE}/${shopId}/milestones`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkRecommendations(shopId: string) {
  const url = `${API_BASE}/${shopId}/recommendations`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkDashboard(shopId: string) {
  const url = `${API_BASE}/${shopId}/dashboard`;
  return shopifyFetchJson(url);
}

export async function getBenchmarkSummary(shopId: string) {
  const url = `${API_BASE}/${shopId}/summary`;
  return shopifyFetchJson(url);
}

export async function exportBenchmark(shopId: string, format: string) {
  const url = new URL(`${API_BASE}/${shopId}/export`);
  url.searchParams.set('format', format);
  return shopifyFetch(url.toString(), { method: 'GET' });
}
