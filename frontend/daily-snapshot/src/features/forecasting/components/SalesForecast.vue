<template>
  <div class="forecast-card sales-forecast" role="region" aria-labelledby="sales-forecast-title">
    <h3 id="sales-forecast-title">Sales Forecast (Next Week)</h3>
    <button class="forecast-refresh" @click="fetchForecast" :disabled="loading" aria-label="Refresh forecast" title="Refresh forecast">
      🔄 Refresh
    </button>
    <div v-if="loading" class="forecast-loading" role="status" aria-live="polite">
      <slot name="loading">
        <span class="spinner" aria-label="Loading"></span>
        <span>Loading forecast...</span>
      </slot>
    </div>
    <div v-else-if="error" class="forecast-error" role="alert">
      <span>{{ error }}</span>
    </div>
    <div v-else class="forecast-result" aria-label="Sales forecast result">
      <BaseChart
        v-if="forecast !== null"
        :data="forecastChartData"
        :options="forecastChartOptions"
        type="bar"
      />
      <span v-else><em>No forecast data available.</em></span>
    </div>
    <!-- Extensibility slot for custom content -->
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSalesForecast } from '../../../api/forecastingApi';
import './SalesForecast.css';
import './ForecastCard.css';
import BaseChart from './BaseChart.vue';
// Chart.js data for single-value bar
const forecastChartData = computed(() => {
  if (forecast.value === null) return { labels: [], datasets: [] };
  return {
    labels: ['Forecast'],
    datasets: [
      {
        label: 'Sales',
        data: [forecast.value],
        backgroundColor: 'rgba(37,99,235,0.5)',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };
});
const forecastChartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  indexAxis: "y" as "y",
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

const forecast = ref<number | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Fetch forecast (can be called on mount or refresh)
async function fetchForecast() {
  loading.value = true;
  error.value = null;
  try {
    const result = await getSalesForecast(props.shopId.toString(), props.segment);
    if (typeof result !== 'number') {
      throw new Error('Invalid sales forecast data received.');
    }
    forecast.value = result;
    emit('loaded', result);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sales forecast.';
    forecast.value = null;
    emit('error', error.value ?? 'Failed to load sales forecast.');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchForecast);
</script>
/* Add spinner CSS for improved UX */
