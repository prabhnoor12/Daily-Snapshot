<template>
  <div class="export-buttons">
    <button @click="download('pdf')">Download PDF</button>
    <button @click="download('excel')">Download Excel</button>
    <span v-if="loading">Downloading...</span>
    <span v-if="error" style="color:red">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { exportBenchmark } from '../../../api/benchmarkApi';
import './ExportButton.css';

const props = defineProps<{ shopId: number }>();
const loading = ref(false);
const error = ref<string | null>(null);

async function download(format: 'pdf' | 'excel') {
  loading.value = true;
  error.value = null;
  try {
    const response = await exportBenchmark(String(props.shopId), format);
    const contentType = response.headers.get('content-type');
    if (!contentType || !(contentType.includes('pdf') || contentType.includes('excel') || contentType.includes('sheet'))) {
      error.value = 'No valid export data received.';
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `benchmarking_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (e: any) {
    error.value = e?.message || 'Download failed.';
  } finally {
    loading.value = false;
  }
}
</script>
