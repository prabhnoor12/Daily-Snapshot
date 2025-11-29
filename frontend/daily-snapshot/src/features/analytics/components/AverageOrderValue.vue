<style src="./analyticsCard.css"></style>


<template>
  <div class="analytics-card" role="region" aria-labelledby="aov-title">
    <h3 id="aov-title">Average Order Value</h3>
    <div class="card-subtitle">See the average value of orders placed today.</div>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else-if="aov !== null">
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

const props = defineProps({
  shopId: {
    type: Number,
    required: true
  }
});
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
    let v = res?.data ?? res;
    if (typeof v === 'object' && v !== null && 'aov' in v) {
      aov.value = v.aov;
    } else if (typeof v === 'number') {
      aov.value = v;
    } else {
      throw new Error('Unexpected response format.');
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to fetch AOV.';
    aov.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchAOV, { immediate: true });
</script>

<style src="./AverageOrderValue.css"></style>
