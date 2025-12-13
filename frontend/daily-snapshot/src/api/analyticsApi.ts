import axios from 'axios';

const API_BASE = 'https://daily-snapshot-1.onrender.com/analytics';

export async function getDayOverDayPerformance(shopId: number) {
  const res = await axios.get(`${API_BASE}/day-over-day/${shopId}`);
  return res.data;
}

export async function get7DayTrendCharts(shopId: number) {
  const res = await axios.get(`${API_BASE}/7-day-trends/${shopId}`);
  return res.data;
}

export async function getTopProductsOfDay(shopId: number, topN: number = 3) {
  const res = await axios.get(`${API_BASE}/top-products/${shopId}`, {
    params: { top_n: topN },
  });
  return res.data;
}

export async function getOrderStatusBreakdown(shopId: number) {
  const res = await axios.get(`${API_BASE}/order-status/${shopId}`);
  return res.data;
}

export async function getRealTimeVisitorCount(shopId: number) {
  const res = await axios.get(`${API_BASE}/real-time-visitors/${shopId}`);
  return res.data;
}

export async function getAverageOrderValue(shopId: number) {
  const res = await axios.get(`${API_BASE}/aov/${shopId}`);
  return res.data;
}

export async function exportDailySnapshot(shopId: number, format: string = 'csv') {
  const res = await axios.get(`${API_BASE}/export/${shopId}`, {
    params: { format },
    responseType: 'blob',
  });
  return res.data;
}

export async function getCustomizableDashboardMetrics(shopId: number, selectedMetrics: string[] = []) {
  const res = await axios.post(`${API_BASE}/custom-dashboard/${shopId}`, {
    selected_metrics: selectedMetrics,
  });
  return res.data;
}

export async function checkBasicAlerts(shopId: number, salesGoal: number = 1000, inventoryThreshold: number = 10) {
  const res = await axios.get(`${API_BASE}/alerts/${shopId}`, {
    params: { sales_goal: salesGoal, inventory_threshold: inventoryThreshold },
  });
  return res.data;
}

export async function getMobileDashboardData(shopId: number) {
  const res = await axios.get(`${API_BASE}/mobile-dashboard/${shopId}`);
  return res.data;
}
