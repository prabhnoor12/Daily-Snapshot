<style src="./analyticsCard.css"></style>

<template>
  <div class="analytics-card">
    <h3>Mobile Dashboard Data</h3>
    <div v-if="loading" class="analytics-loading">Loading...</div>
    <div v-else-if="error" class="analytics-error">{{ error }}</div>
    <div v-else-if="data">
      <ul>
        <li v-for="(value, key) in data" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </li>
      </ul>
    </div>
    <div v-else class="analytics-empty">No data available.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getMobileDashboardData } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number }>();
const data = ref<Record<string, any> | null>(null);
const loading = ref(false);
const error = ref('');

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getMobileDashboardData(props.shopId);
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


<style src="./MobileDashboard.css"></style>
