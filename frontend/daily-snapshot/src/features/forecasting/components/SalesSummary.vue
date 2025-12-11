<template>
  <div class="sales-summary">
    <h3>Sales Summary</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <strong>{{ summary }}</strong>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesSummary } from '../../../api/forecastingApi';
import './SalesSummary.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const summary = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    summary.value = await getSalesSummary(props.shopId, props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load summary.';
  } finally {
    loading.value = false;
  }
});
</script>
