<template>
  <div class="forecast-card arima-container" role="region" aria-labelledby="arima-title">
    <h3 id="arima-title">Sales ARIMA Forecast</h3>
    <button class="arima-refresh" @click="fetchForecast" :disabled="loading" aria-label="Refresh forecast" title="Refresh forecast">
      🔄 Refresh
    </button>
    <div v-if="loading" class="arima-loading" role="status" aria-live="polite">
      <slot name="loading">
        <span class="spinner" aria-label="Loading"></span>
        <span>Loading forecast...</span>
      </slot>
    </div>
    <div v-else-if="error" class="arima-error" role="alert">
      <span>{{ error }}</span>
    </div>
    <div v-else class="arima-list" aria-label="ARIMA forecast results">
      <BaseChart
        v-if="forecast.forecast && forecast.forecast.length"
        :data="arimaChartData"
        :options="arimaChartOptions"
        type="line"
      />
      <span v-else><em>No forecast data available.</em></span>
    </div>
    <div v-if="forecast.confidence_intervals" class="confidence-intervals" aria-label="Confidence Intervals">
      <h4>Confidence Intervals</h4>
      <pre>{{ formatConfidenceIntervals(forecast.confidence_intervals) }}</pre>
    </div>
    <!-- Extensibility slot for custom content -->
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted} from 'vue';

import { getSalesArima } from '../../../api/forecastingApi';
import './SalesArima.css';
import './ForecastCard.css';
import BaseChart from './BaseChart.vue';
// Chart.js data for ARIMA time-series line
const arimaChartData = computed(() => {
  if (!forecast.value.forecast || !forecast.value.forecast.length) return { labels: [], datasets: [] };
  return {
    labels: forecast.value.forecast.map((_, idx) => `Day ${idx + 1}`),
    datasets: [
      {
        label: 'ARIMA Forecast',
        data: forecast.value.forecast,
        backgroundColor: 'rgba(37,99,235,0.2)',
        borderColor: '#2563eb',
        fill: true,
        tension: 0.3,
      },
    ],
  };
});
const arimaChartOptions = computed(() => ({
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
  (e: 'loaded', value: { forecast: number[]; confidence_intervals: Record<string, any> | null }): void;
}>();

// ARIMA forecast result type
interface ArimaResult {
  forecast: number[];
  confidence_intervals: Record<string, any> | null;
}

const forecast = ref<ArimaResult>({ forecast: [], confidence_intervals: null });
const loading = ref(false);
const error = ref<string | null>(null);

// Format confidence intervals for display
function formatConfidenceIntervals(intervals: Record<string, any> | null): string {
  if (!intervals) return '';
  try {
    return JSON.stringify(intervals, null, 2);
  } catch {
    return String(intervals);
  }
}

// Fetch forecast (can be called on mount or refresh)
async function fetchForecast() {
  loading.value = true;
  error.value = null;
  try {
    const result = await getSalesArima(props.shopId, props.segment);
    if (!result || !Array.isArray(result.forecast)) {
      throw new Error('Invalid ARIMA forecast data received.');
    }
    forecast.value = {
      forecast: result.forecast,
      confidence_intervals: result.confidence_intervals ?? null,
    };
    emit('loaded', forecast.value);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load ARIMA forecast.';
    forecast.value = { forecast: [], confidence_intervals: null };
    emit('error', error.value ?? 'Failed to load ARIMA forecast.');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchForecast);
</script>
/* Add spinner CSS for improved UX */
