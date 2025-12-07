
<template>
  <section class="subscription-list" aria-labelledby="subscription-list-title">
    <h2 id="subscription-list-title">Subscriptions</h2>
    <template v-if="subscriptions && subscriptions.length">
      <ul>
        <li v-for="sub in subscriptions" :key="sub.id" class="subscription-item">
          <span class="subscription-plan">{{ sub.plan }}</span>
          <span class="subscription-status">({{ sub.status }})</span>
          <button
            type="button"
            @click="$emit('select', sub)"
            aria-label="View details for {{ sub.plan }} subscription"
            class="details-btn"
          >
            Details
          </button>
        </li>
      </ul>
    </template>
    <template v-else>
      <p class="empty" role="status">No subscriptions found.</p>
    </template>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

// Subscription type definition for prop validation
export interface Subscription {
  id: number;
  plan: string;
  status: string;
  // Add more fields as needed
}

export default defineComponent({
  name: 'SubscriptionList',
  props: {
    subscriptions: {
      type: Array as PropType<Subscription[]>,
      required: true,
      validator: (arr: Subscription[]) =>
        Array.isArray(arr) &&
        arr.every(sub =>
          typeof sub.id === 'number' &&
          typeof sub.plan === 'string' &&
          typeof sub.status === 'string'
        )
    }
  }
});
</script>

<!-- Import scoped CSS for maintainability -->
<style src="./SubscriptionList.css" scoped></style>
