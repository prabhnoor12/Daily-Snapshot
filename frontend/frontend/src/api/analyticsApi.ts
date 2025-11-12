

import axios from 'axios';

const API_URL = '/api/analytics';

// Helper to unwrap backend ApiResponse { statusCode, data, message, ... }
function unwrap<T>(body: unknown): T {
	if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
		return (body as Record<string, unknown>).data as T;
	}
	return body as T;
}

// --- Types ---
export interface SnapshotResponse {
	sales: number;
	orders: number;
	aov: number;
	liveVisitors: number | null;
	topProduct: { id: string; title: string; revenue: number } | null;
	partial?: boolean;
}

export interface TrendDay {
	date: string;
	sales: number;
	orders: number;
	aov: number;
	topProduct: { id: string; title: string; revenue: number } | null;
	partial?: boolean;
}

export interface CompareResponse {
	sales: { today: number; yesterday: number; change: string | null };
	orders: { today: number; yesterday: number; change: string | null };
	aov: { today: number; yesterday: number; change: string | null };
	partial?: boolean;
}

export interface RangeResponse {
	sales: number;
	orders: number;
	aov: number;
	topProducts: { id: string; title: string; revenue: number }[];
	partial?: boolean;
}

export interface TopProductsResponse {
	topProducts: { id: string; title: string; revenue: number }[];
	partial?: boolean;
}

export interface OrderStatusResponse {
	financial: Record<string, number>;
	fulfillment: Record<string, number>;
	partial?: boolean;
}

export interface CustomerInsightsResponse {
	newCustomers: number;
	returningCustomers: number;
	partial?: boolean;
}

export interface ExportAnalyticsResponse {
	data: Array<{
		id: string;
		totalPrice: number;
		createdAt: string;
		financialStatus: string;
		fulfillmentStatus: string;
	}>;
	partial?: boolean;
}

export interface ForecastResponse {
	forecast: Array<{ date: string; predictedSales: number }>;
}

export interface AnomaliesResponse {
	anomalies: Array<{ date: string; sales: number; zScore: number }>;
	mean: number;
	std: number;
}

// --- API Calls ---
// Helper to detect HTML responses (common when dev proxy is missing)
function assertNotHtml(body: unknown) {
	if (typeof body === 'string') {
		const trimmed = body.trim().toLowerCase();
		// quick heuristic: HTML documents will start with '<!doctype' or '<html'
		if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<!doctype html')) {
			throw new Error('Received HTML response from API. Check dev proxy / API base URL (likely missing or misconfigured).');
		}
	}
	return body;
}

export const getDailySnapshot = () =>
	axios.get<SnapshotResponse>(`${API_URL}/snapshot`).then(r => unwrap<SnapshotResponse>(assertNotHtml(r.data)));

export const getTrend = () =>
	axios.get<unknown>(`${API_URL}/trend`).then(r => unwrap<TrendDay[]>(assertNotHtml(r.data)));

export const getDayOverDay = () =>
	axios.get<CompareResponse>(`${API_URL}/compare`).then(r => unwrap<CompareResponse>(assertNotHtml(r.data)));

export const getRange = (start: string, end: string) =>
	axios.get<RangeResponse>(`${API_URL}/range`, { params: { start, end } }).then(r => unwrap<RangeResponse>(r.data));

export const getTopProducts = (limit = 5) =>
	axios.get<TopProductsResponse>(`${API_URL}/products/top`, { params: { limit } }).then(r => unwrap<TopProductsResponse>(r.data));

export const getOrderStatus = () =>
	axios.get<OrderStatusResponse>(`${API_URL}/orders/status`).then(r => unwrap<OrderStatusResponse>(r.data));

export const getCustomerInsights = () =>
	axios.get<CustomerInsightsResponse>(`${API_URL}/customers/insights`).then(r => unwrap<CustomerInsightsResponse>(r.data));

export const exportAnalytics = (format: 'json' | 'csv' = 'json') =>
	axios.get<ExportAnalyticsResponse | string>(`${API_URL}/export`, { params: { format } }).then(r => unwrap<ExportAnalyticsResponse | string>(r.data));

export const getForecast = () =>
	axios.get<ForecastResponse>(`${API_URL}/forecast`).then(r => unwrap<ForecastResponse>(r.data));

export const getAnomalies = () =>
	axios.get<AnomaliesResponse>(`${API_URL}/anomalies`).then(r => unwrap<AnomaliesResponse>(r.data));
