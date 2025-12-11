<template>
  <div class="sales-trend">
    <h3>Sales Trend</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <strong>{{ trend }}</strong>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesTrend } from '../../../api/forecastingApi';
import './SalesTrend.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const trend = ref<number | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    trend.value = await getSalesTrend(props.shopId, props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sales trend.';
  } finally {
    loading.value = false;
  }
});
</script>
