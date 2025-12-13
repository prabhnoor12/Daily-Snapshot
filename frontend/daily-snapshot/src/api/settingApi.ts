import axios from 'axios';

const API_BASE = 'https://daily-snapshot-1.onrender.com/api/settings';

// Get all settings for a user
export function getSettings(userId: number) {
  return axios.get(`${API_BASE}/${userId}`);
}

// Load default settings for a user (with optional overrides)
export function loadDefaultSettings(userId: number, overrides: Record<string, any> = {}) {
  return axios.post(`${API_BASE}/load-defaults/${userId}`, overrides);
}

// Bulk update settings for a user
export function bulkUpdateSettings(userId: number, settings: Record<string, any>, transactional = false) {
  return axios.post(`${API_BASE}/bulk-update/${userId}?transactional=${transactional}`, settings);
}

// Reset settings to default (optionally for specific keys, and notify user)
export function resetSettings(userId: number, keys?: string[], notifyUser = false) {
  return axios.post(`${API_BASE}/reset/${userId}`, { keys, notify_user: notifyUser });
}
