<template>
  <div class="analytics-card">
    <h3>Day Over Day Performance</h3>
    <div v-if="loading" class="analytics-loading">Loading...</div>
    <div v-else-if="error" class="analytics-error">{{ error }}</div>
    <div v-else-if="data">
      <div class="dod-section">
        <div>
          <strong>Today</strong>
          <ul>
            <li>Sales: {{ data.today.sales }}</li>
            <li>Orders: {{ data.today.orders }}</li>
            <li>Visitors: {{ data.today.visitors }}</li>
          </ul>
        </div>
        <div>
          <strong>Yesterday</strong>
          <ul>
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
import { ref, watch } from 'vue';
import { getDayOverDayPerformance } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number }>();
const data = ref<any>(null);
const loading = ref(false);
const error = ref('');

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getDayOverDayPerformance(props.shopId);
    data.value = res.data;
  } catch (e: any) {
    error.value = 'Failed to fetch data.';
    data.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchData, { immediate: true });
</script>


<style src="./DayOverDay.css"></style>
