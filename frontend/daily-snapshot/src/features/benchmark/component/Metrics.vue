<template>
  <div>
    <h3>Benchmarking Metrics</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ul class="metrics-list">
        <li v-for="(value, key) in metrics" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMetrics } from '../../../api/benchmarkApi';
import './Metrics.css';

const props = defineProps<{ shopId: number }>();
const metrics = ref<Record<string, any>>({});
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    metrics.value = await getMetrics(props.shopId);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load metrics.';
  } finally {
    loading.value = false;
  }
});
</script>
