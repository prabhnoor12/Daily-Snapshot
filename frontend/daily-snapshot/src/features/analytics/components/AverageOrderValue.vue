<style src="./analyticsCard.css"></style>


<template>
  <div class="analytics-card">
    <h3>Average Order Value</h3>
    <div class="card-subtitle">See the average value of orders placed today.</div>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else-if="aov !== null">
      <div class="aov-display" style="margin-bottom: 1.1rem;">
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

const props = defineProps<{ shopId: number }>();
const aov = ref<number|null>(null);
const loading = ref(false);
const error = ref('');

const formattedAOV = computed(() => {
  if (aov.value === null || isNaN(aov.value)) return '-';
  return aov.value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
});

async function fetchAOV() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAverageOrderValue(props.shopId);
    // API may return { aov: number } or just a number
    aov.value = typeof res === 'object' && res !== null && 'aov' in res ? res.aov : res;
  } catch (e: any) {
    error.value = 'Failed to fetch AOV.';
    aov.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchAOV, { immediate: true });
</script>

<style src="./AverageOrderValue.css"></style>
