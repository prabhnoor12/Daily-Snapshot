
import axios from 'axios';

const API_URL = '/api/shopifywebhook';

export interface ShopifyWebhookPayload {
	topic: string;
	data: unknown;
}

// Send a webhook payload to the backend (raw body)
export const sendShopifyWebhook = (payload: ShopifyWebhookPayload) =>
	axios.post(`${API_URL}`, payload, {
		headers: {
			'Content-Type': 'application/json',
		},
	});

// Optionally, support topic-specific endpoints
export const sendTopicWebhook = (topic: string, payload: unknown) =>
	axios.post(`${API_URL}/${topic}`, payload, {
		headers: {
			'Content-Type': 'application/json',
		},
	});
