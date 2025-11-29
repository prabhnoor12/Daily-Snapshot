<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { computed, toRefs } from 'vue';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps<{
  labels: string[];
  data: number[];
  colors?: string[];
  title?: string;
}>();

const { labels, data, colors, title } = toRefs(props);

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      data: data.value,
      backgroundColor: colors?.value || defaultColors.slice(0, data.value.length),
      borderWidth: 1,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' as const },
    title: title.value ? { display: true, text: title.value, font: { size: 16 } } : undefined,
    tooltip: { enabled: true },
  },
}));

const defaultColors = [
  '#2a8c4a', // green
  '#e6a700', // yellow
  '#d32f2f', // red
  '#235390', // blue
  '#008060', // teal
];
</script>
