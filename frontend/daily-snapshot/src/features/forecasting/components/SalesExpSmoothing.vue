<template>
  <div class="forecast-card exp-smoothing-container" role="region" aria-labelledby="exp-smoothing-title">
    <h3 id="exp-smoothing-title">Sales Exponential Smoothing Forecast</h3>
    <button class="exp-smoothing-refresh" @click="fetchForecast" :disabled="loading" aria-label="Refresh forecast" title="Refresh forecast">
      🔄 Refresh
    </button>
    <div v-if="loading" class="exp-smoothing-loading" role="status" aria-live="polite">
      <slot name="loading">
        <span class="spinner" aria-label="Loading"></span>
        <span>Loading forecast...</span>
      </slot>
    </div>
    <div v-else-if="error" class="exp-smoothing-error" role="alert">
      <span>{{ error }}</span>
    </div>
    <div v-else class="exp-smoothing-list" aria-label="Exponential Smoothing forecast results">
      <BaseChart
        v-if="forecast.length"
        :data="expSmoothingChartData"
        :options="expSmoothingChartOptions"
        type="line"
      />
      <span v-else><em>No forecast data available.</em></span>
    </div>
    <!-- Extensibility slot for custom content -->
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSalesExpSmoothing } from '../../../api/forecastingApi';
import './SalesExpSmoothing.css';
import './ForecastCard.css';
import BaseChart from './BaseChart.vue';
// Chart.js data for time-series line
const expSmoothingChartData = computed(() => {
  if (!forecast.value.length) return { labels: [], datasets: [] };
  return {
    labels: forecast.value.map((_, idx) => `Day ${idx + 1}`),
    datasets: [
      {
        label: 'Forecast',
        data: forecast.value,
        backgroundColor: 'rgba(37,99,235,0.2)',
        borderColor: '#2563eb',
        fill: true,
        tension: 0.3,
      },
    ],
  };
});
const expSmoothingChartOptions = computed(() => ({
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

// Prop validation and defaults
const props = defineProps<{
  shopId: number;
  segment?: string;
}>();

// Emits for error and loaded events
const emit = defineEmits<{
  (e: 'error', message: string): void;
  (e: 'loaded', value: number[]): void;
}>();

const forecast = ref<number[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Fetch forecast (can be called on mount or refresh)
async function fetchForecast() {
  loading.value = true;
  error.value = null;
  try {
    const result = await getSalesExpSmoothing(props.shopId, props.segment);
    if (!result || !Array.isArray(result)) {
      throw new Error('Invalid exponential smoothing forecast data received.');
    }
    forecast.value = result;
    emit('loaded', result);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load exp smoothing forecast.';
    forecast.value = [];
    emit('error', error.value ?? 'Failed to load exp smoothing forecast.');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchForecast);
</script>
/* Add spinner CSS for improved UX */
