
import { shopifyFetchJson } from './shopifyFetch';

const API_BASE = 'https://daily-snapshot-1.onrender.com/api/user';

// Set user status
export function setUserStatus(userId: number, status: string) {
	return shopifyFetchJson(`${API_BASE}/status/${userId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ status }),
	});
}

// Suspend user
export function suspendUser(userId: number, reason: string) {
	return shopifyFetchJson(`${API_BASE}/suspend/${userId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ reason }),
	});
}

// Initiate password reset
export function initiatePasswordReset(email: string) {
	return shopifyFetchJson(`${API_BASE}/password-reset/initiate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
	});
}

// Complete password reset
export function completePasswordReset(token: string, newPassword: string) {
	return shopifyFetchJson(`${API_BASE}/password-reset/complete`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, new_password: newPassword }),
	});
}

// Get user info
export function getUserInfo(userId: number) {
	return shopifyFetchJson(`${API_BASE}/info/${userId}`);
}
