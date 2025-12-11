<template>
  <div class="sales-forecast">
    <h3>Sales Forecast (Next Week)</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <strong>{{ forecast }}</strong>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesForecast } from '@/api/forecastingApi';
import './SalesForecast.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const forecast = ref<number | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    forecast.value = await getSalesForecast(props.shopId, props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sales forecast.';
  } finally {
    loading.value = false;
  }
});
</script>
