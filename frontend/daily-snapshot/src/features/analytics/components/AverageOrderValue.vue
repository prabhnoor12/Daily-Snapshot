<style src="./analyticsCard.css"></style>


<template>
  <div class="analytics-card" role="region" aria-labelledby="aov-title">
    <h3 id="aov-title">Average Order Value</h3>
    <div class="card-subtitle">See the average value of orders placed today.</div>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else-if="aov !== null">
      <BaseLineChart
        v-if="aovTrend.length > 1"
        :labels="aovTrendLabels"
        :datasets="[{ label: 'AOV', data: aovTrend, borderColor: '#2a8c4a', backgroundColor: '#2a8c4a' }]"
        y-label="AOV"
        title="AOV Trend (7 days)"
        style="margin-bottom: 1.2rem; height: 180px;"
      />
      <div class="aov-display">
        <span class="aov-label">Today's AOV:</span>
        <span class="aov-value" :title="formattedAOV">{{ formattedAOV }}</span>
      </div>
      <div class="aov-note">Average Order Value is calculated as total sales divided by number of orders for today.</div>
    </div>
    <div v-else class="analytics-empty">No data available.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getAverageOrderValue } from '../../../api/analyticsApi';
import BaseLineChart from './BaseLineChart.vue';

const props = defineProps({
  shopId: {
    type: Number,
    required: true
  }
});
const aov = ref<number|null>(null);
const loading = ref(false);
const error = ref('');
const aovTrend = ref<number[]>([]);
const aovTrendLabels = ref<string[]>([]);

const formattedAOV = computed(() => {
  if (aov.value === null || isNaN(aov.value)) return '-';
  return aov.value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
});

async function fetchAOV() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAverageOrderValue(props.shopId);
    let v = res?.data ?? res;
    if (typeof v === 'object' && v !== null && 'aov' in v) {
      aov.value = v.aov;
      // If API provides a trend array, use it; else fallback to just today
      if (Array.isArray(v.trend) && Array.isArray(v.trendLabels)) {
        aovTrend.value = v.trend;
        aovTrendLabels.value = v.trendLabels;
      } else {
        aovTrend.value = [v.aov];
        aovTrendLabels.value = ['Today'];
      }
    } else if (typeof v === 'number') {
      aov.value = v;
      aovTrend.value = [v];
      aovTrendLabels.value = ['Today'];
    } else {
      throw new Error('Unexpected response format.');
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch AOV.';
    aov.value = null;
    aovTrend.value = [];
    aovTrendLabels.value = [];
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchAOV, { immediate: true });
</script>

<style src="./AverageOrderValue.css"></style>
