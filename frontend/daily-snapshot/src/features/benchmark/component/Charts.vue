
<template>
  <div class="chart-wrapper">
    <div v-if="loading" class="chart-loading"><span class="spinner"></span> Loading chart...</div>
    <div v-else-if="error" class="chart-error">{{ error }}</div>
    <template v-else>
      <Bar v-if="type === 'bar'" :data="data" :options="mergedOptions" />
      <Line v-else-if="type === 'line'" :data="data" :options="mergedOptions" />
      <Pie v-else-if="type === 'pie'" :data="data" :options="mergedOptions" />
      <slot />
    </template>
  </div>
</template>


<script setup lang="ts">
import { Bar, Line, Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';
import { computed } from 'vue';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

interface ChartProps {
  type: 'bar' | 'line' | 'pie',
  data: any,
  options?: any,
  loading?: boolean,
  error?: string | null
}

const props = defineProps<ChartProps>();

const defaultOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
    title: { display: false }
  }
};

const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...(props.options || {})
}));

const loading = computed(() => props.loading === true);
const error = computed(() => props.error || null);
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 250px;
  position: relative;
}
.chart-loading {
  display: flex;
  align-items: center;
  color: #888;
  min-height: 200px;
}
.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid #ccc;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 0.5em;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.chart-error {
  color: #b00020;
  min-height: 200px;
  display: flex;
  align-items: center;
}
</style>
