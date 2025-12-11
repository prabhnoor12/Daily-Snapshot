
<template>
  <div>
    <h3>Data Quality Warnings</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else class="warnings-list">
      <li v-for="(warning, idx) in warnings" :key="idx">{{ warning }}</li>
      <li v-if="!warnings.length"><em>No warnings.</em></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getWarnings } from '../../../api/benchmarkApi';
import './Warnings.css';

const props = defineProps<{ shopId: number }>();
const warnings = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    warnings.value = await getWarnings(props.shopId);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load warnings.';
  } finally {
    loading.value = false;
  }
});
</script>
