


<template>
  <div v-if="subscription" class="subscription-detail">
    <div v-if="loadingAction" class="spinner-overlay" aria-live="polite" aria-busy="true">
      <div class="spinner"></div>
    </div>
    <h3>Subscription Details <span :class="['status-badge', subscription.status]">{{ subscription.status }}</span></h3>
    <section class="section-details">
      <div class="detail-row">
        <strong>Plan:</strong>
        <template v-if="editingPlan">
          <select v-model="editedPlan">
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <button @click="savePlanEdit" :disabled="loadingAction === 'edit-plan'" title="Save"><span class="icon">💾</span></button>
          <button @click="cancelPlanEdit" title="Cancel"><span class="icon">✖️</span></button>
        </template>
        <template v-else>
          {{ subscription.plan }}
          <button @click="startPlanEdit" title="Edit Plan" class="icon-btn"><span class="icon">✏️</span></button>
        </template>
      </div>
      <div class="detail-row"><strong>Start Date:</strong> {{ subscription.start_date || 'N/A' }}</div>
      <div class="detail-row"><strong>End Date:</strong> {{ subscription.end_date || 'N/A' }}</div>
      <div class="detail-row"><strong>Next Billing:</strong> {{ subscription.next_billing || 'N/A' }}</div>
      <div class="detail-row"><strong>Payment Status:</strong> <span :class="['payment-badge', subscription.payment_status]">{{ subscription.payment_status || 'N/A' }}</span>
        <button v-if="subscription.payment_status === 'failed'" @click="retryPayment" :disabled="loadingAction === 'retry-payment'" title="Retry Payment"><span class="icon">🔄</span></button>
      </div>
      <div class="detail-row"><strong>User:</strong> <a href="#" @click.prevent="showUserInfo" title="View user info">View</a></div>
    </section>
    <section class="section-actions">
      <h4>Actions</h4>
      <div class="actions">
        <button type="button" :disabled="loadingAction === 'start-trial'" @click="onStartTrial" aria-label="Start trial for this subscription" title="Start a trial for this user"><span class="icon">🚀</span> <span v-if="loadingAction === 'start-trial'">Starting...</span><span v-else>Start Trial</span></button>
        <button type="button" :disabled="loadingAction === 'convert'" @click="onConvert" aria-label="Convert trial to paid" title="Convert trial to paid"><span class="icon">💳</span> <span v-if="loadingAction === 'convert'">Converting...</span><span v-else>Convert to Paid</span></button>
        <button type="button" :disabled="loadingAction === 'renew'" @click="onRenew" aria-label="Renew subscription" title="Renew subscription"><span class="icon">🔁</span> <span v-if="loadingAction === 'renew'">Renewing...</span><span v-else>Renew</span></button>
        <button type="button" :disabled="loadingAction === 'handle-expiry'" @click="onHandleExpiry" aria-label="Handle expiry" title="Handle expiry"><span class="icon">⏰</span> <span v-if="loadingAction === 'handle-expiry'">Handling...</span><span v-else>Handle Expiry</span></button>
        <button type="button" :disabled="loadingAction === 'check-grace'" @click="onCheckGrace" aria-label="Check grace period" title="Check grace period"><span class="icon">🕒</span> <span v-if="loadingAction === 'check-grace'">Checking...</span><span v-else>Check Grace Period</span></button>
        <button type="button" :disabled="loadingAction === 'cancel'" @click="confirmCancel" aria-label="Cancel subscription" title="Cancel subscription"><span class="icon">❌</span> Cancel</button>
      </div>
    </section>
    <section class="section-history">
      <h4 @click="toggleHistory" class="collapsible">Subscription History <span>{{ showHistory ? '▲' : '▼' }}</span></h4>
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
        <button @click="cancelSubscription" :disabled="loadingAction === 'cancel'">Yes, Cancel</button>
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
import { ref, defineProps, defineEmits, watch } from 'vue';
import * as subscriptionApi from '../../../api/subscriptionApi';

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
const editingPlan = ref<boolean>(false);
const editedPlan = ref<string>(props.subscription?.plan || 'standard');
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

async function cancelSubscription(): Promise<void> {
  if (!props.subscription?.id) return;
  loadingAction.value = 'cancel';
  try {
    await withRetry(() => subscriptionApi.cancelSubscription(props.subscription!.id));
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
    await withRetry(() => subscriptionApi.startTrial(props.subscription!.user_id as number));
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
    await withRetry(() => subscriptionApi.convertTrialToPaid(subscription.id));
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
    await withRetry(() => subscriptionApi.renewSubscription(subscription.id));
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
    await withRetry(() => subscriptionApi.handleExpiry(subscription.id));
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
    const res = await withRetry(() => subscriptionApi.isInGracePeriod(subscription.id));
    const inGrace = res?.data?.in_grace;
    showFeedback(inGrace ? 'Subscription is in grace period.' : 'Not in grace period.');
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to check grace period.', 'error');
  } finally {
    loadingAction.value = null;
  }
}

function startPlanEdit() {
  editingPlan.value = true;
  editedPlan.value = props.subscription?.plan || 'standard';
}

function cancelPlanEdit() {
  editingPlan.value = false;
}

async function savePlanEdit() {
  if (!props.subscription?.id) return;
  loadingAction.value = 'edit-plan';
  try {
    await withRetry(() => subscriptionApi.updatePlan(props.subscription!.id, editedPlan.value));
    showFeedback('Plan updated.');
    emit('updated');
    editingPlan.value = false;
  } catch (e: any) {
    showFeedback(e?.response?.data?.message || e?.message || 'Failed to update plan.', 'error');
  } finally {
    loadingAction.value = null;
  }
}

async function retryPayment() {
  if (!props.subscription?.id) return;
  loadingAction.value = 'retry-payment';
  try {
    await withRetry(() => subscriptionApi.retryPayment(props.subscription!.id));
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
