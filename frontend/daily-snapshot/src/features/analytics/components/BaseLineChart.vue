<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { computed, toRefs } from 'vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps<{
  labels: string[];
  datasets: Array<{ label: string; data: number[]; borderColor?: string; backgroundColor?: string; fill?: boolean }>;
  yLabel?: string;
  title?: string;
}>();

const { labels, datasets, yLabel, title } = toRefs(props);

const chartData = computed(() => ({
  labels: labels.value,
  datasets: datasets.value.map((ds, i) => ({
    ...ds,
    borderColor: ds.borderColor || defaultColors[i % defaultColors.length],
    backgroundColor: ds.backgroundColor || defaultColors[i % defaultColors.length],
    fill: ds.fill ?? false,
    tension: 0.3,
    pointRadius: 3,
    pointHoverRadius: 5,
  })),
}));

const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' as const },
    title: title.value ? { display: true, text: title.value, font: { size: 16 } } : undefined,
    tooltip: { enabled: true },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: yLabel?.value ? { display: true, text: yLabel.value } : undefined,
      ticks: { precision: 0 },
    },
    x: {
      title: { display: false },
    },
  },
}));

const defaultColors = [
  '#235390', // blue
  '#2a8c4a', // green
  '#e6a700', // yellow
  '#d32f2f', // red
  '#008060', // teal
];
</script>
