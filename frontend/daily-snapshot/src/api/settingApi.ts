
import { shopifyFetchJson } from './shopifyFetch';

const API_BASE = 'https://daily-snapshot-1.onrender.com/api/settings';


// Get all settings for a user
export function getSettings(userId: number) {
  return shopifyFetchJson(`${API_BASE}/${userId}`);
}

// Load default settings for a user (with optional overrides)
export function loadDefaultSettings(userId: number, overrides: Record<string, any> = {}) {
  return shopifyFetchJson(`${API_BASE}/load-defaults/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(overrides),
  });
}

// Bulk update settings for a user
export function bulkUpdateSettings(userId: number, settings: Record<string, any>, transactional = false) {
  return shopifyFetchJson(`${API_BASE}/bulk-update/${userId}?transactional=${transactional}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}

// Reset settings to default (optionally for specific keys, and notify user)
export function resetSettings(userId: number, keys?: string[], notifyUser = false) {
  return shopifyFetchJson(`${API_BASE}/reset/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys, notify_user: notifyUser }),
  });
}
