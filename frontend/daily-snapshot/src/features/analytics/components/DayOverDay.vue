<style src="./analyticsCard.css"></style>
<template>
  <div class="analytics-card" role="region" aria-labelledby="dod-title">
    <h3 id="dod-title">Day Over Day Performance</h3>
    <div class="card-subtitle">Compare today’s sales, orders, and visitors with yesterday.</div>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else-if="data">
      <BaseLineChart
        :labels="['Sales', 'Orders', 'Visitors']"
        :datasets="dodChartDatasets"
        y-label="Count"
        title="Today vs Yesterday"
        style="margin-bottom: 1.5rem;"
      />
      <div class="dod-section">
        <div class="dod-col">
          <strong>Today</strong>
          <ul class="dod-list">
            <li>Sales: {{ data.today.sales }}</li>
            <li>Orders: {{ data.today.orders }}</li>
            <li>Visitors: {{ data.today.visitors }}</li>
          </ul>
        </div>
        <div class="dod-col">
          <strong>Yesterday</strong>
          <ul class="dod-list">
            <li>Sales: {{ data.yesterday.sales }}</li>
            <li>Orders: {{ data.yesterday.orders }}</li>
            <li>Visitors: {{ data.yesterday.visitors }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="analytics-empty">No data available.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getDayOverDayPerformance } from '../../../api/analyticsApi';
import BaseLineChart from './BaseLineChart.vue';

const props = defineProps({
  shopId: {
    type: Number,
    required: true
  }
});
const data = ref<any>(null);
const loading = ref(false);
const error = ref('');

const dodChartDatasets = computed(() => {
  if (!data.value) return [];
  return [
    {
      label: 'Today',
      data: [
        data.value.today.sales ?? 0,
        data.value.today.orders ?? 0,
        data.value.today.visitors ?? 0,
      ],
      borderColor: '#235390',
      backgroundColor: '#235390',
    },
    {
      label: 'Yesterday',
      data: [
        data.value.yesterday.sales ?? 0,
        data.value.yesterday.orders ?? 0,
        data.value.yesterday.visitors ?? 0,
      ],
      borderColor: '#e6a700',
      backgroundColor: '#e6a700',
    },
  ];
});

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getDayOverDayPerformance(props.shopId);
    let d = res?.data || res;
    if (!d || typeof d !== 'object' || !d.today || !d.yesterday) {
      throw new Error('Unexpected response format.');
    }
    data.value = d;
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch data.';
    data.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchData, { immediate: true });
</script>


<style src="./DayOverDay.css"></style>
