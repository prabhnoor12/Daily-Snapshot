<template>
  <div v-if="subscription" class="subscription-detail">
    <div v-if="loadingAction" class="spinner-overlay" aria-live="polite" aria-busy="true">
      <div class="spinner"></div>
    </div>
    <h3>Subscription Details <span :class="['status-badge', subscription.status]">{{ subscription.status }}</span></h3>
    <section class="section-details">
      <div class="detail-row">
        <strong>Plan:</strong>
        <div>
          <strong>Standard</strong> ($20/month)
          <span class="trial-info">14-day trial period</span>
        </div>
      </div>
      <div class="detail-row"><strong>Start Date:</strong> {{ subscription.start_date || 'N/A' }}</div>
      <div class="detail-row"><strong>End Date:</strong> {{ subscription.end_date || 'N/A' }}</div>
      <div class="detail-row"><strong>Next Billing:</strong> {{ subscription.next_billing || 'N/A' }}</div>
      <div class="detail-row"><strong>Trial Period:</strong> 14 days</div>
      <div class="detail-row"><strong>Payment Status:</strong> <span :class="['payment-badge', subscription.payment_status]">{{ subscription.payment_status || 'N/A' }}</span>
        <button v-if="subscription.payment_status === 'failed'" @click="handleRetryPayment()" :disabled="loadingAction === 'retry-payment'" title="Retry Payment">Retry</button>
      </div>
      <div class="detail-row"><strong>User:</strong> <a href="#" @click.prevent="showUserInfo" title="View user info">View</a></div>
    </section>
    <section class="section-actions">
      <h4>Actions</h4>
      <div class="actions">
        <button type="button" :disabled="loadingAction === 'start-trial'" @click="onStartTrial" aria-label="Start trial for this subscription" title="Start a trial for this user"><span v-if="loadingAction === 'start-trial'">Starting...</span><span v-else>Start Trial</span></button>
        <button type="button" :disabled="loadingAction === 'convert'" @click="onConvert" aria-label="Convert trial to paid" title="Convert trial to paid"><span v-if="loadingAction === 'convert'">Converting...</span><span v-else>Convert to Paid</span></button>
        <button type="button" :disabled="loadingAction === 'renew'" @click="onRenew" aria-label="Renew subscription" title="Renew subscription"><span v-if="loadingAction === 'renew'">Renewing...</span><span v-else>Renew</span></button>
        <button type="button" :disabled="loadingAction === 'handle-expiry'" @click="onHandleExpiry" aria-label="Handle expiry" title="Handle expiry"><span v-if="loadingAction === 'handle-expiry'">Handling...</span><span v-else>Handle Expiry</span></button>
        <button type="button" :disabled="loadingAction === 'check-grace'" @click="onCheckGrace" aria-label="Check grace period" title="Check grace period"><span v-if="loadingAction === 'check-grace'">Checking...</span><span v-else>Check Grace Period</span></button>
        <button type="button" :disabled="loadingAction === 'cancel'" @click="confirmCancel" aria-label="Cancel subscription" title="Cancel subscription">Cancel</button>
      </div>
    </section>
    <section class="section-history">
      <h4 @click="toggleHistory" class="collapsible">Subscription History <span>{{ showHistory ? 'Hide' : 'Show' }}</span></h4>
      <div v-if="showHistory">
        <ul v-if="subscription.history && subscription.history.length">
          <li v-for="(item, idx) in subscription.history" :key="idx">{{ item }}</li>
        </ul>
        <div v-else>No history available.</div>
      </div>
    </section>
    <div v-if="feedback.message" :class="['feedback', feedback.type]">{{ feedback.message }}</div>
    <div v-if="showCancelDialog" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal">
        <p>Are you sure you want to cancel this subscription?</p>
        <button @click="handleCancelSubscription()" :disabled="loadingAction === 'cancel'">Yes, Cancel</button>
        <button @click="showCancelDialog = false">No</button>
      </div>
    </div>
    <div v-if="showUserModal" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal">
        <h4>User Info</h4>
        <pre>{{ subscription.user_info || 'No user info available.' }}</pre>
        <button @click="showUserModal = false">Close</button>
      </div>
    </div>
  </div>
  <div v-else class="subscription-detail-empty">
    <div class="skeleton-loader"></div>
    <p>No subscription selected.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  startTrial,
  convertTrialToPaid,
  renewSubscription,
  handleExpiry,
  isInGracePeriod
} from '../../../api/subscriptionApi';

interface Subscription {
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

interface Feedback {
  message: string;
  type: 'success' | 'error' | '';
}
type AsyncFn<T = any> = () => Promise<T>;

const props = defineProps<{ subscription: Subscription | null }>();
const emit = defineEmits(['updated']);

const loadingAction = ref<string | null>(null);
let loadingTimeout: number | null = null;
// Watch loadingAction and set a timeout to clear it after 8 seconds
watch(loadingAction, (val) => {
  if (val) {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    loadingTimeout = window.setTimeout(() => {
      if (loadingAction.value) {
        loadingAction.value = null;
        showFeedback('Request timed out. Please try again.', 'error');
      }
    }, 8000);
  } else {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
});
const feedback = ref<Feedback>({ message: '', type: '' });
// Removed unused plan edit refs
const showCancelDialog = ref<boolean>(false);
const showUserModal = ref<boolean>(false);
const showHistory = ref<boolean>(false);

function showFeedback(message: string, type: 'success' | 'error' | '' = 'success') {
  feedback.value = { message, type };
  setTimeout(() => (feedback.value = { message: '', type: '' }), 3500);
}

function showUserInfo(): void {
  showUserModal.value = true;
}

function toggleHistory(): void {
  showHistory.value = !showHistory.value;
}

function confirmCancel(): void {
  showCancelDialog.value = true;
}

async function withRetry<T>(fn: AsyncFn<T>, maxTries = 3, timeoutMs = 8000): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeoutMs))
      ]);
    } catch (e) {
      lastError = e;
      if (attempt < maxTries) {
        await new Promise(res => setTimeout(res, 500));
      }
    }
  }
  throw lastError;
}

async function handleCancelSubscription(): Promise<void> {
  if (!props.subscription?.id) return;
  loadingAction.value = 'cancel';
  try {
    const { cancelSubscription } = await import('../../../api/subscriptionApi');
    await withRetry(() => cancelSubscription(props.subscription!.id));
    showFeedback('Subscription cancelled.');
    emit('updated');
    showCancelDialog.value = false;
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to cancel subscription.', 'error');
  } finally {
    loadingAction.value = null;
  }
}

async function onStartTrial(): Promise<void> {
  if (typeof props.subscription?.user_id !== 'number') return;
  loadingAction.value = 'start-trial';
  try {
    await withRetry(() => startTrial(props.subscription!.user_id as number));
    showFeedback('Trial started successfully.');
    emit('updated');
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to start trial.', 'error');
  } finally {
    loadingAction.value = null;
  }
}


async function onConvert() {
  const subscription = props.subscription;
  if (!subscription || !subscription.id) return;
  loadingAction.value = 'convert';
  try {
    await withRetry(() => convertTrialToPaid(subscription.id));
    showFeedback('Converted to paid successfully.');
    emit('updated');
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to convert.', 'error');
  } finally {
    loadingAction.value = null;
  }
}


async function onRenew() {
  const subscription = props.subscription;
  if (!subscription || !subscription.id) return;
  loadingAction.value = 'renew';
  try {
    await withRetry(() => renewSubscription(subscription.id));
    showFeedback('Renewed successfully.');
    emit('updated');
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to renew.', 'error');
  } finally {
    loadingAction.value = null;
  }
}


async function onHandleExpiry() {
  const subscription = props.subscription;
  if (!subscription || !subscription.id) return;
  loadingAction.value = 'handle-expiry';
  try {
    await withRetry(() => handleExpiry(subscription.id));
    showFeedback('Expiry handled successfully.');
    emit('updated');
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to handle expiry.', 'error');
  } finally {
    loadingAction.value = null;
  }
}


async function onCheckGrace() {
  const subscription = props.subscription;
  if (!subscription || !subscription.id) return;
  loadingAction.value = 'check-grace';
  try {
    const res = await withRetry(() => isInGracePeriod(subscription.id));
    const inGrace = res?.data?.in_grace;
    showFeedback(inGrace ? 'Subscription is in grace period.' : 'Not in grace period.');
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to check grace period.', 'error');
  } finally {
    loadingAction.value = null;
  }
}


async function handleRetryPayment(): Promise<void> {
  if (!props.subscription?.id) return;
  loadingAction.value = 'retry-payment';
  try {
    const { retryPayment } = await import('../../../api/subscriptionApi');
    await withRetry(() => retryPayment(props.subscription!.id));
    showFeedback('Payment retried.');
    emit('updated');
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to retry payment.', 'error');
  } finally {
    loadingAction.value = null;
  }
}
</script>
<style src="./SubscriptionDetail.css"></style>
