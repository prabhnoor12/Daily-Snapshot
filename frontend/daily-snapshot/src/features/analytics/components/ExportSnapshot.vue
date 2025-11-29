<style src="./analyticsCard.css"></style>

<template>
  <div class="analytics-card" role="region" aria-labelledby="export-snapshot-title">
    <h3 id="export-snapshot-title">Export Daily Snapshot</h3>
    <div class="card-subtitle">Download your daily sales and order data as a CSV file.</div>
    <button
      @click="exportSnapshot"
      :disabled="loading"
      class="export-btn"
      :aria-busy="loading"
      aria-label="Export daily snapshot as CSV"
    >
      <span v-if="loading">Exporting...</span>
      <span v-else>Export as CSV</span>
    </button>
    <div v-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-if="success" class="analytics-success" role="status">Exported! Check your downloads.</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { exportDailySnapshot } from '../../../api/analyticsApi';

const props = defineProps({
  shopId: {
    type: Number,
    required: true
  }
});
const loading = ref(false);
const error = ref('');
const success = ref(false);

async function exportSnapshot() {
  loading.value = true;
  error.value = '';
  success.value = false;
  try {
    const res = await exportDailySnapshot(props.shopId, 'csv');
    const blob = new Blob([res], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_snapshot_${props.shopId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    success.value = true;
  } catch (e: any) {
    error.value = e?.message || 'Export failed.';
  } finally {
    loading.value = false;
  }
}
</script>


<style src="./ExportSnapshot.css"></style>
