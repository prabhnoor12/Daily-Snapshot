<template>
  <section class="metrics-section" aria-labelledby="metrics-title">
    <h3 id="metrics-title">Benchmarking Metrics</h3>
    <div v-if="loading" class="metrics-loading" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span> Loading...
    </div>
    <div v-else-if="error" class="metrics-error" role="alert">
      {{ error }}
      <button @click="fetchMetrics" class="retry-btn">Retry</button>
    </div>
    <div v-else-if="isEmpty" class="metrics-empty" role="status">
      No metrics available.
    </div>
    <ul v-else class="metrics-list">
      <li v-for="(value, key) in metrics" :key="key">
        <strong>{{ key }}:</strong> {{ value }}
      </li>
    </ul>
    <!-- Chart visualization for metrics -->
    <Charts
      v-if="chartData && chartData.labels.length > 0"
      type="bar"
      :data="chartData"
      :options="chartOptions"
      :loading="loading"
      :error="error"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getMetrics } from '../../../api/benchmarkApi';
import Charts from './Charts.vue';

const props = defineProps<{ shopId: number }>();

interface MetricsData {
  [key: string]: string | number | null;
}

const metrics = ref<MetricsData>({});
const loading = ref(false);
const error = ref<string | null>(null);

const isEmpty = computed(() => Object.keys(metrics.value).length === 0);

// Prepare chart data from metrics
const chartData = computed(() => {
  const m = metrics.value;
  if (!m || Object.keys(m).length === 0) return { labels: [], datasets: [] };
  const labels = Object.keys(m);
  const data = labels.map(key => {
    const value = m[key];
    return typeof value === 'number' ? value : (parseFloat(value as string) || 0);
  });
  return {
    labels,
    datasets: [
      {
        label: 'Value',
        backgroundColor: '#42a5f5',
        data
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Benchmarking Metrics' }
  },
  scales: {
    y: { beginAtZero: true }
  }
};


function sanitizeError(err: any): string {
  const msg = err?.message || err?.toString() || '';
  if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
    return 'Failed to load metrics (server error).';
  }
  return msg || 'Failed to load metrics.';
}

async function fetchMetrics() {
  loading.value = true;
  error.value = null;
  try {
    const result = await getMetrics(String(props.shopId));
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      metrics.value = result;
    } else {
      error.value = 'No valid metrics data received.';
      metrics.value = {};
    }
  } catch (e: any) {
    error.value = sanitizeError(e);
    metrics.value = {};
  } finally {
    loading.value = false;
  }
}

onMounted(fetchMetrics);
</script>
<style scoped>
.metrics-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  margin: 1rem 0;
}
.metrics-section h3 {
  margin-bottom: 1rem;
}
.metrics-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
}
.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid #ccc;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.metrics-error {
  color: #b00020;
  margin-bottom: 1rem;
}
.retry-btn {
  margin-left: 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-size: 0.95em;
}
.retry-btn:hover {
  background: #0056b3;
}
.metrics-empty {
  color: #888;
  font-style: italic;
}
.metrics-list {
  margin: 0;
  padding-left: 1.25rem;
}
.metrics-list li {
  margin-bottom: 0.5rem;
}
</style>
