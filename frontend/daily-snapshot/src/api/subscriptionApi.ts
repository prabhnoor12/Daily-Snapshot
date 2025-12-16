

import { shopifyFetchJson } from './shopifyFetch';

const API_BASE = 'https://daily-snapshot-1.onrender.com/api/subscription';

// Types
export interface Subscription {
  id: number;
  plan: string;
  status: string;
  start_date?: string;
  end_date?: string;
  user_id?: number;
  next_billing?: string;
  payment_status?: string;
  history?: string[];
  user_info?: string;
  [key: string]: any;
}


// List all subscriptions
export function listSubscriptions() {
  return shopifyFetchJson(`${API_BASE}/list`);
}

// Get a single subscription by ID
export function getSubscription(id: number) {
  return shopifyFetchJson(`${API_BASE}/${id}`);
}

// Start trial
export function startTrial(userId: number, plan: string = 'standard', trialDays: number = 15, notifyUser: boolean = true) {
  return shopifyFetchJson(`${API_BASE}/start-trial/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, trial_days: trialDays, notify_user: notifyUser }),
  });
}

// Convert trial to paid
export function convertTrialToPaid(subscriptionId: number, notifyUser: boolean = true) {
  return shopifyFetchJson(`${API_BASE}/convert/${subscriptionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notify_user: notifyUser }),
  });
}

// Renew subscription
export function renewSubscription(subscriptionId: number, renewalDays: number = 30, autoRenew: boolean = true, notifyUser: boolean = true) {
  return shopifyFetchJson(`${API_BASE}/renew/${subscriptionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ renewal_days: renewalDays, auto_renew: autoRenew, notify_user: notifyUser }),
  });
}

// Handle expiry
export function handleExpiry(subscriptionId: number, notifyUser: boolean = true) {
  return shopifyFetchJson(`${API_BASE}/handle-expiry/${subscriptionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notify_user: notifyUser }),
  });
}

// Check grace period
export function isInGracePeriod(subscriptionId: number, notifyUser: boolean = true) {
  const url = new URL(`${API_BASE}/in-grace/${subscriptionId}`);
  url.searchParams.set('notify_user', String(notifyUser));
  return shopifyFetchJson(url.toString());
}

// Update plan
export function updatePlan(subscriptionId: number, plan: string) {
  return shopifyFetchJson(`${API_BASE}/plan/${subscriptionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
}

// Retry payment
export function retryPayment(subscriptionId: number) {
  return shopifyFetchJson(`${API_BASE}/retry-payment/${subscriptionId}`, {
    method: 'POST',
  });
}

// Cancel subscription
export function cancelSubscription(subscriptionId: number) {
  return shopifyFetchJson(`${API_BASE}/cancel/${subscriptionId}`, {
    method: 'POST',
  });
}

