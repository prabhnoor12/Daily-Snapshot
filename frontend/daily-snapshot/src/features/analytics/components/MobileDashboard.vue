<style src="./analyticsCard.css"></style>

<template>
  <div class="analytics-card" role="region" aria-labelledby="mobile-dashboard-title">
    <h3 id="mobile-dashboard-title">Mobile Dashboard Data</h3>
    <div class="card-subtitle">Key metrics for your store, optimized for mobile view.</div>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else-if="data && Object.keys(data).length" class="metrics-list">
      <ul>
        <li v-for="(value, key) in data" :key="key">
          <strong>{{ formatMetricLabel(key) }}:</strong> {{ value }}
        </li>
      </ul>
    </div>
    <div v-else class="analytics-empty">No data available.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getMobileDashboardData } from '../../../api/analyticsApi';

const props = defineProps({
  shopId: {
    type: Number,
    required: true
  }
});
const data = ref<Record<string, any> | null>(null);
const loading = ref(false);
const error = ref('');

function formatMetricLabel(metric: string) {
  switch (metric) {
    case 'sales': return 'Sales';
    case 'orders': return 'Orders';
    case 'aov': return 'Average Order Value';
    case 'live_visitors': return 'Live Visitors';
    default: return metric.charAt(0).toUpperCase() + metric.slice(1);
  }
}

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getMobileDashboardData(props.shopId);
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


<style src="./MobileDashboard.css"></style>
