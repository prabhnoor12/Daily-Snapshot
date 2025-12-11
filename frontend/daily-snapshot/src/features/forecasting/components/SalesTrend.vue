<template>
  <div class="forecast-card sales-trend-container" role="region" aria-labelledby="sales-trend-title">
    <h3 id="sales-trend-title">Sales Trend</h3>
    <button class="sales-trend-refresh" @click="fetchTrend" :disabled="loading" aria-label="Refresh trend" title="Refresh trend">
      🔄 Refresh
    </button>
    <div v-if="loading" class="sales-trend-loading" role="status" aria-live="polite">
      <slot name="loading">
        <span class="spinner" aria-label="Loading"></span>
        <span>Loading trend...</span>
      </slot>
    </div>
    <div v-else-if="error" class="sales-trend-error" role="alert">
      <span>{{ error }}</span>
    </div>
    <div v-else class="sales-trend-result" aria-label="Sales trend result">
      <BaseChart
        v-if="trend !== null"
        :data="trendChartData"
        :options="trendChartOptions"
        type="bar"
      />
      <span v-else><em>No trend data available.</em></span>
    </div>
    <!-- Extensibility slot for custom content -->
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSalesTrend } from '../../../api/forecastingApi';
import './SalesTrend.css';
import './ForecastCard.css';
import BaseChart from './BaseChart.vue';
// Chart.js data for single-value bar (trend as percent)
const trendChartData = computed(() => {
  if (trend.value === null) return { labels: [], datasets: [] };
  return {
    labels: ['Trend'],
    datasets: [
      {
        label: 'Trend',
        data: [Number((trend.value * 100).toFixed(2))],
        backgroundColor: trend.value > 0 ? 'rgba(34,197,94,0.5)' : trend.value < 0 ? 'rgba(239,68,68,0.5)' : 'rgba(37,99,235,0.5)',
        borderColor: trend.value > 0 ? '#22c55e' : trend.value < 0 ? '#ef4444' : '#2563eb',
        borderWidth: 1,
      },
    ],
  };
});
const trendChartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  indexAxis: 'y' as const,
  scales: {
    x: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
    y: { grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
  },
}));

// Prop validation and defaults
const props = defineProps<{
  shopId: number;
  segment?: string;
}>();

// Emits for error and loaded events
const emit = defineEmits<{
  (e: 'error', message: string): void;
  (e: 'loaded', value: number | null): void;
}>();

const trend = ref<number | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Format trend for display (e.g., add % if needed)
// (Removed unused formatTrend function)

// Fetch trend (can be called on mount or refresh)
async function fetchTrend() {
  loading.value = true;
  error.value = null;
  try {
    const result = await getSalesTrend(props.shopId, props.segment);
    if (typeof result !== 'number') {
      throw new Error('Invalid sales trend data received.');
    }
    trend.value = result;
    emit('loaded', result);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sales trend.';
    trend.value = null;
    emit('error', error.value ?? 'Failed to load sales trend.');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchTrend);
</script>
/* Add spinner CSS for improved UX */
