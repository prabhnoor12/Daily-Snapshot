<template>
  <div class="sales-chart">
    <h3>Sales Chart Data</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <pre v-else>{{ chart }}</pre>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesChart } from '../../../api/forecastingApi';
import './SalesChart.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const chart = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    chart.value = await getSalesChart(props.shopId, props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sales chart.';
  } finally {
    loading.value = false;
  }
});
</script>
