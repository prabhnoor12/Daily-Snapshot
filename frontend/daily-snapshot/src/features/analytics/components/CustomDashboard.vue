<template>
  <div class="analytics-card">
    <h3>Customizable Dashboard Metrics</h3>
    <div v-if="loading" class="analytics-loading">Loading...</div>
    <div v-else-if="error" class="analytics-error">{{ error }}</div>
    <div v-else-if="metrics">
      <ul>
        <li v-for="(value, key) in metrics" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </li>
      </ul>
    </div>
    <div v-else class="analytics-empty">No data available.</div>
    <div class="metrics-selector">
      <label v-for="metric in availableMetrics" :key="metric">
        <input type="checkbox" :value="metric" v-model="selectedMetrics" />
        {{ metric }}
      </label>
      <button @click="fetchMetrics" :disabled="loading">Update</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getCustomizableDashboardMetrics } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number }>();
const availableMetrics = ['sales', 'orders', 'aov', 'live_visitors'];
const selectedMetrics = ref<string[]>([...availableMetrics]);
const metrics = ref<Record<string, any> | null>(null);
const loading = ref(false);
const error = ref('');

async function fetchMetrics() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getCustomizableDashboardMetrics(props.shopId, selectedMetrics.value);
    metrics.value = res.data;
  } catch (e: any) {
    error.value = 'Failed to fetch metrics.';
    metrics.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchMetrics, { immediate: true });
</script>

<style src="./CustomDashboard.css"></style>
