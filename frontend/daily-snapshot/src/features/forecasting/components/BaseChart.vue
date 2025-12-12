

<template>
  <div class="base-chart-wrapper" :aria-busy="loading" role="region" :aria-label="ariaLabel">
    <component
      :is="chartComponent"
      v-if="!loading && !error && hasData"
      :data="data as any"
      :options="mergedOptions"
      v-bind="chartAttrs"
    />
    <div v-else-if="loading" class="chart-loading" role="status" aria-live="polite">
      <slot name="loading">
        <span class="spinner" aria-label="Loading"></span>
        <span>Loading chart...</span>
      </slot>
    </div>
    <div v-else-if="error" class="chart-error" role="alert">
      <slot name="error">{{ error }}</slot>
    </div>
    <div v-else class="chart-empty" aria-label="No chart data">
      <slot name="empty"><em>No chart data available.</em></slot>
    </div>
    <slot />
  </div>
</template>


<script setup lang="ts">
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'vue-chartjs';
import type { ChartOptions, Plugin } from 'chart.js';
import { computed, toRefs } from 'vue';

const props = defineProps<{
  type?: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';
  data: any; // ChartData<any> for flexibility
  options?: ChartOptions;
  plugins?: Plugin[];
  loading?: boolean;
  error?: string | null;
  ariaLabel?: string;
}>();

const { type, data, options, plugins, loading, error, ariaLabel } = toRefs(props);

const chartComponent = computed(() => {
  switch (type.value) {
    case 'bar': return Bar;
    case 'line': return Line;
    case 'pie': return Pie;
    case 'doughnut': return Doughnut;
    case 'radar': return Radar;
    case 'polarArea': return PolarArea;
    case 'bubble': return Bubble;
    case 'scatter': return Scatter;
    default: return Line;
  }
});

const hasData = computed(() => {
  if (!data.value) return false;
  if (Array.isArray(data.value.datasets)) {
    return data.value.datasets.length > 0 && data.value.datasets.some((ds: { data: unknown[] | unknown }) => Array.isArray(ds.data) ? ds.data.length > 0 : !!ds.data);
  }
  return true;
});

const defaultOptions: ChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
};

const defaultScales = {
  x: { grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
  y: { grid: { color: '#e5e7eb' }, ticks: { color: '#222' } },
};

const chartTypesWithScales = ['bar', 'line', 'bubble', 'scatter'];

const mergedOptions = computed(() => {
  const base = {
    ...defaultOptions,
    ...(options.value || {}),
    plugins: {
      ...defaultOptions.plugins,
      ...(options.value?.plugins || {}),
    },
  };
  // Only add scales for chart types that support Cartesian scales
  if (chartTypesWithScales.includes(type.value || 'line')) {
    return {
      ...base,
      scales: {
        ...defaultScales,
        ...(options.value?.scales || {}),
      },
    };
  } else {
    // Remove scales property if present for non-Cartesian charts
    const { scales, ...rest } = base;
    return rest;
  }
});

// Pass through extra chart.js props if needed
const chartAttrs = computed(() => ({
  plugins: plugins?.value,
}));
</script>


<style scoped>
.base-chart-wrapper {
  width: 100%;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
canvas {
  max-width: 100% !important;
  height: auto !important;
}
.chart-loading, .chart-error, .chart-empty {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #2563eb;
}
.chart-error {
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 6px;
  padding: 0.5rem 1rem;
}
.spinner {
  width: 1.2em;
  height: 1.2em;
  border: 2px solid #cbd5e1;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  margin-right: 0.5em;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

