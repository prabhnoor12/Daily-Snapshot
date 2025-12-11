<template>
  <div class="dashboard-summary">
    <h3>Dashboard Summary</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ul>
        <li v-for="(value, key) in dashboard" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDashboard } from '../../../api/benchmarkApi';
import './Dashboard.css';

const props = defineProps<{ shopId: number }>();
const dashboard = ref<Record<string, any>>({});
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    dashboard.value = await getDashboard(props.shopId);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load dashboard.';
  } finally {
    loading.value = false;
  }
});
</script>
