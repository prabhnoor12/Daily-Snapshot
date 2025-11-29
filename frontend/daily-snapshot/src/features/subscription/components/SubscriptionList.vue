
<template>
  <div class="subscription-list">
    <h2>Subscriptions</h2>
    <template v-if="subscriptions && subscriptions.length">
      <ul>
        <li v-for="sub in subscriptions" :key="sub.id">
          <span>{{ sub.plan }} ({{ sub.status }})</span>
          <button type="button" @click="$emit('select', sub)" aria-label="View details for subscription">
            Details
          </button>
        </li>
      </ul>
    </template>
    <template v-else>
      <p class="empty">No subscriptions found.</p>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export interface Subscription {
  id: number;
  plan: string;
  status: string;
  [key: string]: any;
}

export default defineComponent({
  name: 'SubscriptionList',
  props: {
    subscriptions: {
      type: Array as PropType<Subscription[]>,
      required: true,
      validator: (arr: Subscription[]) => Array.isArray(arr) && arr.every(sub => 'id' in sub && 'plan' in sub && 'status' in sub)
    }
  }
});
</script>

<style src="./SubscriptionList.css"></style>
