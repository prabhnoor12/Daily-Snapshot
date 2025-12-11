<template>
  <div class="base-chart-wrapper">
    <Bar v-if="type === 'bar'" :data="data" :options="options" />
    <Line v-else :data="data" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Bar, Line } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';
import { computed } from 'vue';

const props = defineProps<{
  type?: 'bar' | 'line';
  data: ChartData<'bar' | 'line'>;
  options?: ChartOptions<'bar' | 'line'>;
}>();

const type = computed(() => props.type || 'line');
const options = computed(() => props.options || {
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
  scales: {
    x: { grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
    y: { grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
  },
});
</script>

<style scoped>
.base-chart-wrapper {
  width: 100%;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}
canvas {
  max-width: 100% !important;
  height: auto !important;
}
</style>
