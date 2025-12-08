<template>
  <div class="subscription-benefits" aria-live="polite">
    <h3>Get Started with Daily Snapshot</h3>
    <ul class="benefits-list">
      <li>Access to the Standard Plan ($20/month)</li>
      <li>14-day free trial period</li>
      <li>Full analytics dashboard</li>
      <li>Priority email support</li>
      <li>Cancel anytime</li>
    </ul>
    <button
      class="start-btn improved-btn"
      @click="handleStart"
      :disabled="loading"
      aria-label="Start your subscription"
      :aria-busy="loading"
    >
      <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
      <span v-if="loading">Starting...</span>
      <span v-else>Start Your Subscription</span>
    </button>
    <p v-if="error" class="form-error" role="alert" aria-live="assertive">
      {{ error }}
      <button v-if="!loading" @click="handleStart" class="retry-btn" aria-label="Retry subscription">Retry</button>
    </p>
    <transition name="fade">
      <div v-if="success" class="form-success-modal" role="status" aria-live="polite">
        <span class="success-icon" aria-hidden="true">✔️</span>
        <span>{{ success }}</span>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import { startTrial } from '../../../api/subscriptionApi';
import { getUserInfo } from '../../../api/userApi';
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
        const userRes = await getUserInfo(userId);
        const user = userRes.data;
        // Check user status (assuming 'status' field exists)
        if (user.status === 'active') {
          await startTrial(userId, 'standard', 14, true);
          success.value = 'Subscription started successfully!';
          emit('submit', {
            plan: 'standard',
            trial_days: 14,
            notify_user: true
          });
        } else {
          error.value = 'User is not eligible to start a subscription.';
        }
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

