<template>
  <div>
    <h3>Sales Warnings</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else class="sales-warnings">
      <li v-for="(warning, idx) in warnings" :key="idx">{{ warning }}</li>
      <li v-if="!warnings.length"><em>No warnings.</em></li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesWarnings } from '../../../api/forecastingApi';
import './SalesWarnings.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const warnings = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    warnings.value = await getSalesWarnings(props.shopId, props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load warnings.';
  } finally {
    loading.value = false;
  }
});
</script>
