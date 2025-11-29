<style src="./analyticsCard.css"></style>
<template>
  <div class="analytics-card">
    <h3>Order Status Breakdown</h3>
    <div class="card-subtitle">Track the fulfillment, pending, and cancelled orders for today.</div>
    <div v-if="loading" class="analytics-loading">Loading...</div>
    <div v-else-if="error" class="analytics-error">{{ error }}</div>
    <div v-else-if="data">
      <ul style="margin-bottom: 1.1rem;">
        <li>Fulfilled: {{ data.fulfilled }}</li>
        <li>Pending: {{ data.pending }}</li>
        <li>Cancelled: {{ data.cancelled }}</li>
      </ul>
    </div>
    <div v-else class="analytics-empty">No data available.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getOrderStatusBreakdown } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number }>();
const data = ref<any>(null);
const loading = ref(false);
const error = ref('');

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getOrderStatusBreakdown(props.shopId);
    data.value = res;
  } catch (e: any) {
    error.value = 'Failed to fetch data.';
    data.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchData, { immediate: true });
</script>

