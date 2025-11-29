<style src="./analyticsCard.css"></style>

<template>
  <div class="analytics-card" role="region" aria-labelledby="custom-dashboard-title">
    <h3 id="custom-dashboard-title">Customizable Dashboard Metrics</h3>
    <div class="card-subtitle">Select which metrics to display on your dashboard.</div>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else-if="metrics && Object.keys(metrics).length" class="metrics-list">
      <ul>
        <li v-for="(value, key) in metrics" :key="key">
          <strong>{{ formatMetricLabel(key) }}:</strong> {{ value }}
        </li>
      </ul>
    </div>
    <div v-else class="analytics-empty">No data available for the selected metrics.</div>
    <form class="metrics-selector" @submit.prevent="fetchMetrics" autocomplete="off" aria-label="Select metrics to display">
      <label v-for="metric in availableMetrics" :key="metric" class="metrics-label">
        <input type="checkbox" :value="metric" v-model="selectedMetrics" :aria-label="formatMetricLabel(metric)" />
        {{ formatMetricLabel(metric) }}
      </label>
      <button type="submit" :disabled="loading" class="metrics-btn">Update</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getCustomizableDashboardMetrics } from '../../../api/analyticsApi';

const props = defineProps({
  shopId: {
    type: Number,
    required: true
  }
});

const availableMetrics = [
  'sales',
  'orders',
  'aov',
  'live_visitors'
];
const selectedMetrics = ref<string[]>([...availableMetrics]);
const metrics = ref<Record<string, any> | null>(null);
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

async function fetchMetrics() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getCustomizableDashboardMetrics(props.shopId, selectedMetrics.value);
    let data = res?.data || res;
    if (typeof data !== 'object' || data === null) {
      throw new Error('Unexpected response format.');
    }
    metrics.value = data;
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch metrics.';
    metrics.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchMetrics, { immediate: true });
</script>

<style src="./CustomDashboard.css"></style>
