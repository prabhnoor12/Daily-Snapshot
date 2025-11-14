
// API client for authentication endpoints
import axios from 'axios';

const API_URL = '/api/auth';

// Offline token (app installation)
export const shopifyAuth = () => axios.get(`${API_URL}`);

// Online token (user login)
export const shopifyAuthOnline = () => axios.get(`${API_URL}/online`);

// Callback for both flows
export const shopifyAuthCallback = (params?: Record<string, string>) =>
	axios.get(`${API_URL}/callback`, { params });

// Logout
export const logout = () => axios.get(`${API_URL.replace('/auth', '/auth/logout')}`);

// Get current authenticated user/shop info
export const getCurrentUser = () => axios.get(`${API_URL.replace('/auth', '/auth/me')}`);
