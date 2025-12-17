<template>
  <div class="sales-chart" role="region" aria-labelledby="sales-chart-title">
    <h3 id="sales-chart-title">Sales Chart Data</h3>
    <div v-if="loading" class="chart-loading" role="status" aria-live="polite">
      <span>Loading chart data...</span>
    </div>
    <div v-else-if="error" class="chart-error" role="alert">
      <span>{{ error }}</span>
    </div>
    <BaseChart
      v-else
      :data="chartJsData"
      :options="chartJsOptions"
      type="line"
    />
    <!-- Extensibility slot for custom content -->
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSalesChart } from '../../../api/forecastingApi';
import BaseChart from './BaseChart.vue';
import './SalesChart.css';

// Prop validation and defaults
const props = defineProps<{
  shopId: number;
  segment?: string;
}>();

// Chart data type
type ChartData = Record<string, any> | string | null;
const chart = ref<ChartData>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Parse API data to chart.js format
const chartJsData = computed(() => {
  if (!chart.value || typeof chart.value !== 'object') {
    return { labels: [], datasets: [] };
  }
  // Example: expecting { labels: [], values: [] } or similar
  const labels = (chart.value.labels || Object.keys(chart.value.values || {})) ?? [];
  const values = chart.value.values || [];
  return {
    labels,
    datasets: [
      {
        label: 'Sales',
        data: Array.isArray(values) ? values : Object.values(values),
        backgroundColor: 'rgba(37,99,235,0.3)',
        borderColor: '#2563eb',
        fill: true,
        tension: 0.3,
      },
    ],
  };
});

const chartJsOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: { grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
    y: { grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
  },
}));

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const result = await getSalesChart(props.shopId.toString(), props.segment);
    if (!result) throw new Error('No chart data received.');
    chart.value = result;
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sales chart.';
    chart.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
