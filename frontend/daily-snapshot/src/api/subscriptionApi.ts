import axios from 'axios';

const API_BASE = '/api/subscription';

// Start trial
export function startTrial(userId: number, plan: string = 'standard', trialDays: number = 15, notifyUser: boolean = true) {
  return axios.post(`${API_BASE}/start-trial/${userId}`, { plan, trial_days: trialDays, notify_user: notifyUser });
}

// Convert trial to paid
export function convertTrialToPaid(subscriptionId: number, notifyUser: boolean = true) {
  return axios.post(`${API_BASE}/convert/${subscriptionId}`, { notify_user: notifyUser });
}

// Renew subscription
export function renewSubscription(subscriptionId: number, renewalDays: number = 30, autoRenew: boolean = true, notifyUser: boolean = true) {
  return axios.post(`${API_BASE}/renew/${subscriptionId}`, { renewal_days: renewalDays, auto_renew: autoRenew, notify_user: notifyUser });
}

// Handle expiry
export function handleExpiry(subscriptionId: number, notifyUser: boolean = true) {
  return axios.post(`${API_BASE}/handle-expiry/${subscriptionId}`, { notify_user: notifyUser });
}

// Check grace period
export function isInGracePeriod(subscriptionId: number, notifyUser: boolean = true) {
  return axios.get(`${API_BASE}/in-grace/${subscriptionId}`, { params: { notify_user: notifyUser } });
}

export function updatePlan(id: number, value: string) {
  throw new Error('Function not implemented.');
}
export function retryPayment(id: number) {
  throw new Error('Function not implemented.');
}

export function cancelSubscription(id: number) {
  throw new Error('Function not implemented.');
}

