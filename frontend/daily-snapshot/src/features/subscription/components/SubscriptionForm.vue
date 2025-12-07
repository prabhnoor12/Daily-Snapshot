<template>
  <div class="subscription-benefits">
    <h3>Get Started with Daily Snapshot</h3>
    <ul class="benefits-list">
      <li>Access to the Standard Plan ($20/month)</li>
      <li>14-day free trial period</li>
      <li>Full analytics dashboard</li>
      <li>Priority email support</li>
      <li>Cancel anytime</li>
    </ul>
    <button class="start-btn improved-btn" @click="handleStart" :disabled="loading">{{ loading ? 'Starting...' : 'Start Your Subscription' }}</button>
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="success" class="form-success">{{ success }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { startTrial } from '../../../api/subscriptionApi';
export interface SubscriptionFormData {
  plan: string;
  trial_days: number;
  notify_user: boolean;
}

export default defineComponent({
  name: 'SubscriptionForm',
  props: {
    initial: {
      type: Object as PropType<SubscriptionFormData>,
      default: () => ({ plan: 'standard', trial_days: 15, notify_user: true }),
      validator: (val: SubscriptionFormData) => val && typeof val.plan === 'string' && typeof val.trial_days === 'number' && typeof val.notify_user === 'boolean'
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(_, { emit }) {

    const error = ref('');
    const success = ref('');
    const loading = ref(false);
    async function handleStart() {
      error.value = '';
      success.value = '';
      loading.value = true;
      try {
        // Replace with actual userId from context if available
        const userId = 1;
        await startTrial(userId, 'standard', 14, true);
        success.value = 'Subscription started successfully!';
        emit('submit', {
          plan: 'standard',
          trial_days: 14,
          notify_user: true
        });
      } catch (e: any) {
        error.value = e?.response?.data?.message || e?.message || 'Failed to start subscription.';
      } finally {
        loading.value = false;
      }
    }
    return { error, success, loading, handleStart };
  }
});
</script>

<style src="./SubscriptionForm.css"></style>
<style>
.improved-btn {
  display: inline-block;
  background: linear-gradient(90deg, #0052cc 0%, #007fff 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 0.85rem 2rem;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0,82,204,0.08);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
.improved-btn:disabled {
  background: #b3c6e6;
  cursor: not-allowed;
  opacity: 0.7;
}
.improved-btn:not(:disabled):hover {
  background: linear-gradient(90deg, #007fff 0%, #0052cc 100%);
  box-shadow: 0 4px 16px rgba(0,82,204,0.12);
  transform: translateY(-2px) scale(1.03);
}
</style>
