
<template>
  <div class="subscription-detail" v-if="subscription">
    <h3>Subscription Details</h3>
    <p><strong>Plan:</strong> {{ subscription.plan }}</p>
    <p><strong>Status:</strong> {{ subscription.status }}</p>
    <p><strong>Start Date:</strong> {{ subscription.start_date || 'N/A' }}</p>
    <p><strong>End Date:</strong> {{ subscription.end_date || 'N/A' }}</p>
    <div class="actions">
      <button type="button" @click="$emit('start-trial', subscription.user_id)" aria-label="Start trial for this subscription">Start Trial</button>
      <button type="button" @click="$emit('convert', subscription.id)" aria-label="Convert trial to paid">Convert to Paid</button>
      <button type="button" @click="$emit('renew', subscription.id)" aria-label="Renew subscription">Renew</button>
      <button type="button" @click="$emit('handle-expiry', subscription.id)" aria-label="Handle expiry">Handle Expiry</button>
      <button type="button" @click="$emit('check-grace', subscription.id)" aria-label="Check grace period">Check Grace Period</button>
    </div>
  </div>
  <div v-else class="subscription-detail-empty">
    <p>No subscription selected.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export interface Subscription {
  id: number;
  plan: string;
  status: string;
  start_date?: string;
  end_date?: string;
  user_id?: number;
  [key: string]: any;
}

export default defineComponent({
  name: 'SubscriptionDetail',
  props: {
    subscription: {
      type: Object as PropType<Subscription>,
      required: false,
      default: null,
      validator: (sub: Subscription) => sub == null || (typeof sub === 'object' && 'id' in sub && 'plan' in sub && 'status' in sub)
    }
  }
});
</script>

<style src="./SubscriptionDetail.css"></style>
