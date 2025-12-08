import axios from 'axios';

const API_BASE = '/api/user';

// Set user status
export function setUserStatus(userId: number, status: string) {
	return axios.post(`${API_BASE}/status/${userId}`, { status });
}

// Suspend user
export function suspendUser(userId: number, reason: string) {
	return axios.post(`${API_BASE}/suspend/${userId}`, { reason });
}

// Initiate password reset
export function initiatePasswordReset(email: string) {
	return axios.post(`${API_BASE}/password-reset/initiate`, { email });
}

// Complete password reset
export function completePasswordReset(token: string, newPassword: string) {
	return axios.post(`${API_BASE}/password-reset/complete`, { token, new_password: newPassword });
}

// Get user info
export function getUserInfo(userId: number) {
	return axios.get(`${API_BASE}/info/${userId}`);
}
