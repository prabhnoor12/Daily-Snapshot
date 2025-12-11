<template>
  <div>
    <h3>Sales ARIMA Forecast</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else class="arima-list">
      <li v-for="(val, idx) in forecast.forecast" :key="idx">Day {{ idx + 1 }}: {{ val }}</li>
    </ul>
    <div v-if="forecast.confidence_intervals" class="confidence-intervals">
      <h4>Confidence Intervals</h4>
      <pre>{{ forecast.confidence_intervals }}</pre>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesArima } from '../../../api/forecastingApi';
import './SalesArima.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const forecast = ref<{ forecast: number[], confidence_intervals: any } | any>({ forecast: [], confidence_intervals: null });
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    forecast.value = await getSalesArima(props.shopId, props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load ARIMA forecast.';
  } finally {
    loading.value = false;
  }
});
</script>
