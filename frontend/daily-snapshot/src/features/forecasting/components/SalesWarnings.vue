<template>
  <div class="forecast-card sales-warnings-container" role="region" aria-labelledby="sales-warnings-title">
    <h3 id="sales-warnings-title">Sales Warnings</h3>
    <button class="sales-warnings-refresh" @click="fetchWarnings" :disabled="loading" aria-label="Refresh warnings" title="Refresh warnings">
      🔄 Refresh
    </button>
    <div v-if="loading" class="sales-warnings-loading" role="status" aria-live="polite">
      <slot name="loading">
        <span class="spinner" aria-label="Loading"></span>
        <span>Loading warnings...</span>
      </slot>
    </div>
    <div v-else-if="error" class="sales-warnings-error" role="alert">
      <span>{{ error }}</span>
    </div>
    <ul v-else class="sales-warnings" aria-label="Sales warnings list">
      <li v-for="(warning, idx) in warnings" :key="idx">
        <span class="warning-icon">⚠️</span> <span class="warning-text">{{ warning }}</span>
      </li>
      <li v-if="!warnings.length"><em>No warnings.</em></li>
    </ul>
    <!-- Extensibility slot for custom content -->
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted,  } from 'vue';

import { getSalesWarnings } from '../../../api/forecastingApi';
import './SalesWarnings.css';
import './ForecastCard.css';

const props = defineProps<{
  shopId: number;
  segment?: string;
}>();

// Emits for error and loaded events
const emit = defineEmits<{
  (e: 'error', message: string): void;
  (e: 'loaded', value: string[]): void;
}>();

const warnings = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Fetch warnings (can be called on mount or refresh)
async function fetchWarnings() {
  loading.value = true;
  error.value = null;
  try {
    const result = await getSalesWarnings(props.shopId.toString(), props.segment);
    if (!result || !Array.isArray(result)) {
      throw new Error('Invalid sales warnings data received.');
    }
    warnings.value = result;
    emit('loaded', result);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load warnings.';
    warnings.value = [];
    emit('error', error.value ?? 'Failed to load warnings.');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchWarnings);
</script>
/* Add spinner CSS for improved UX */
