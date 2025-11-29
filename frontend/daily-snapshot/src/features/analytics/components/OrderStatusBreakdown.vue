<style src="./analyticsCard.css"></style>
<template>
  <div class="analytics-card" role="region" aria-labelledby="order-status-title">
    <h3 id="order-status-title">Order Status Breakdown</h3>
    <div class="card-subtitle">Track the fulfillment, pending, and cancelled orders for today.</div>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else-if="data && typeof data === 'object' && (data.fulfilled !== undefined || data.pending !== undefined || data.cancelled !== undefined)" class="order-status-list">
      <ul>
        <li><strong>Fulfilled:</strong> {{ data.fulfilled ?? 0 }}</li>
        <li><strong>Pending:</strong> {{ data.pending ?? 0 }}</li>
        <li><strong>Cancelled:</strong> {{ data.cancelled ?? 0 }}</li>
      </ul>
    </div>
    <div v-else class="analytics-empty">No data available.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getOrderStatusBreakdown } from '../../../api/analyticsApi';

const props = defineProps({
  shopId: {
    type: Number,
    required: true
  }
});
const data = ref<Record<string, any> | null>(null);
const loading = ref(false);
const error = ref('');

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getOrderStatusBreakdown(props.shopId);
    let d = res?.data || res;
    if (!d || typeof d !== 'object') {
      throw new Error('Unexpected response format.');
    }
    data.value = d;
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch data.';
    data.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchData, { immediate: true });
</script>

