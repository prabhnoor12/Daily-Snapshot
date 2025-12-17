

<template>
  <section class="warnings-section" aria-labelledby="warnings-title">
    <h3 id="warnings-title">Data Quality Warnings</h3>
    <div v-if="loading" class="warnings-loading" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span> Loading...
    </div>
    <div v-else-if="error" class="warnings-error" role="alert">
      {{ error }}
      <button @click="fetchWarnings" class="retry-btn">Retry</button>
    </div>
    <ul v-else-if="warnings.length" class="warnings-list">
      <li v-for="(warning, idx) in warnings" :key="idx">{{ warning }}</li>
    </ul>
    <div v-else class="warnings-empty" role="status">
      <em>No warnings.</em>
    </div>
  </section>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getWarnings } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();
const warnings = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);


function sanitizeError(err: any): string {
  const msg = err?.message || err?.toString() || '';
  if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
    return 'Failed to load warnings (server error).';
  }
  return msg || 'Failed to load warnings.';
}

async function fetchWarnings() {
  loading.value = true;
  error.value = null;
  try {
    const result = await getWarnings(String(props.shopId));
    if (Array.isArray(result)) {
      warnings.value = result;
    } else {
      error.value = 'No valid warnings data received.';
      warnings.value = [];
    }
  } catch (e: any) {
    error.value = sanitizeError(e);
    warnings.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchWarnings);
</script>
<style scoped>
.warnings-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  margin: 1rem 0;
}
.warnings-section h3 {
  margin-bottom: 1rem;
}
.warnings-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
}
.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid #ccc;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.warnings-error {
  color: #b00020;
  margin-bottom: 1rem;
}
.retry-btn {
  margin-left: 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-size: 0.95em;
}
.retry-btn:hover {
  background: #0056b3;
}
.warnings-empty {
  color: #888;
  font-style: italic;
}
.warnings-list {
  margin: 0;
  padding-left: 1.25rem;
}
.warnings-list li {
  margin-bottom: 0.5rem;
}
</style>
