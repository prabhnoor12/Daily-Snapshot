<template>
  <div>
    <h3>Sales Exponential Smoothing Forecast</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else class="exp-smoothing-list">
      <li v-for="(val, idx) in forecast" :key="idx">Day {{ idx + 1 }}: {{ val }}</li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesExpSmoothing } from '../../../api/forecastingApi';
import './SalesExpSmoothing.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const forecast = ref<number[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    forecast.value = await getSalesExpSmoothing(props.shopId, props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load exp smoothing forecast.';
  } finally {
    loading.value = false;
  }
});
</script>
