import axios from 'axios';

const API_BASE = '/benchmarking';

export async function getMetrics(shopId: number) {
	const url = `${API_BASE}/${shopId}/metrics`;
	const response = await axios.get(url);
	return response.data;
}

export async function getTrends(shopId: number) {
	const url = `${API_BASE}/${shopId}/trends`;
	const response = await axios.get(url);
	return response.data;
}

export async function getCorrelation(shopId: number) {
	const url = `${API_BASE}/${shopId}/correlation`;
	const response = await axios.get(url);
	return response.data;
}

export async function getSegmentation(shopId: number) {
	const url = `${API_BASE}/${shopId}/segmentation`;
	const response = await axios.get(url);
	return response.data;
}

export async function getWarnings(shopId: number) {
	const url = `${API_BASE}/${shopId}/warnings`;
	const response = await axios.get(url);
	return response.data;
}

export async function getMilestones(shopId: number) {
	const url = `${API_BASE}/${shopId}/milestones`;
	const response = await axios.get(url);
	return response.data;
}

export async function getRecommendations(shopId: number) {
	const url = `${API_BASE}/${shopId}/recommendations`;
	const response = await axios.get(url);
	return response.data;
}

export async function getDashboard(shopId: number) {
	const url = `${API_BASE}/${shopId}/dashboard`;
	const response = await axios.get(url);
	return response.data;
}

export async function getSummary(shopId: number) {
	const url = `${API_BASE}/${shopId}/summary`;
	const response = await axios.get(url);
	return response.data;
}

export async function exportBenchmarking(shopId: number, format: 'pdf' | 'excel' = 'pdf') {
	const url = `${API_BASE}/${shopId}/export`;
	const response = await axios.get(url, {
		params: { format },
		responseType: 'blob',
	});
	return response;
}
