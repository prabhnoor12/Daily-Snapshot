

import axios from 'axios';

const API_URL = '/api/subscription';

export interface Subscription {
	id: string;
	plan: string;
	status: string;
	userId: string;
	// Add more fields as needed
}

export interface SubscriptionPayload {
	plan: string;
	userId: string;
	// Add more fields as needed
}

export const getSubscriptions = () => axios.get<Subscription[]>(`${API_URL}`);
export const createSubscription = (data: SubscriptionPayload) => axios.post<Subscription>(`${API_URL}`, data);
export const createProSubscription = (data: SubscriptionPayload) => axios.post<Subscription>(`${API_URL}/pro`, data);
export const cancelSubscription = (chargeId: string) => axios.post<{ success: boolean }>(`${API_URL}/${chargeId}/cancel`);
