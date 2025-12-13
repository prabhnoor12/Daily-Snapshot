import axios from 'axios';

const API_BASE = 'https://daily-snapshot-1.onrender.com/forecasting';

// --- Sales Forecast Endpoints ---
export async function getSalesForecast(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/forecast`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getSalesExpSmoothing(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/exp_smoothing`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getSalesArima(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/arima`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getSalesTrend(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/trend`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getSalesChart(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/chart`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getSalesWarnings(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/warnings`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getSalesSummary(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/summary`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getSalesRecommendation(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/recommendation`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function exportSalesForecast(shopId: number, format: 'pdf' | 'excel' = 'pdf', segment?: string) {
	const params: Record<string, string> = { format };
	if (segment) params.segment = segment;
	const url = `${API_BASE}/sales/${shopId}/export`;
	const response = await axios.get(url, {
		params,
		responseType: 'blob',
	});
	return response;
}

// --- Orders Forecast Endpoints ---
export async function getOrdersForecast(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/forecast`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getOrdersExpSmoothing(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/exp_smoothing`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getOrdersArima(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/arima`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getOrdersTrend(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/trend`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getOrdersChart(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/chart`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getOrdersWarnings(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/warnings`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getOrdersSummary(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/summary`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function getOrdersRecommendation(shopId: number, segment?: string) {
	const params: Record<string, string> = {};
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/recommendation`;
	const response = await axios.get(url, { params });
	return response.data;
}

export async function exportOrdersForecast(shopId: number, format: 'pdf' | 'excel' = 'pdf', segment?: string) {
	const params: Record<string, string> = { format };
	if (segment) params.segment = segment;
	const url = `${API_BASE}/orders/${shopId}/export`;
	const response = await axios.get(url, {
		params,
		responseType: 'blob',
	});
	return response;
}
