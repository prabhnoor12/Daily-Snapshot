
<template>
  <div class="analytics-card">
    <h3>Basic Alerts</h3>
    <div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
    <div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
    <div v-else>
      <div v-if="alerts && alerts.length" class="alerts-list">
        <ul>
          <li v-for="alert in alerts" :key="alert" class="alert-item">
            <span class="alert-icon" aria-label="Alert">⚠️</span> {{ alert }}
          </li>
        </ul>
      </div>
      <div v-else class="analytics-empty">No alerts for the current settings.</div>
    </div>
    <form class="alerts-controls" @submit.prevent="fetchAlerts">
      <label>
        Sales Goal:
        <input type="number" v-model.number="salesGoal" min="0" aria-label="Sales Goal" />
      </label>
      <label>
        Inventory Threshold:
        <input type="number" v-model.number="inventoryThreshold" min="0" aria-label="Inventory Threshold" />
      </label>
      <button type="submit" :disabled="loading">Check Alerts</button>
    </form>
    <div class="alerts-note">
      Adjust your sales goal and inventory threshold to customize alert triggers. Alerts help you stay on top of your daily targets and inventory needs.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { checkBasicAlerts } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number }>();
const salesGoal = ref(1000);
const inventoryThreshold = ref(10);
const alerts = ref<string[]>([]);
const loading = ref(false);
const error = ref('');

async function fetchAlerts() {
  loading.value = true;
  error.value = '';
  try {
    const res = await checkBasicAlerts(props.shopId, salesGoal.value, inventoryThreshold.value);
    alerts.value = res.data?.alerts || [];
  } catch (e: any) {
    error.value = 'Failed to fetch alerts.';
    alerts.value = [];
  } finally {
    loading.value = false;
  }
}

watch(() => props.shopId, fetchAlerts, { immediate: true });
</script>


<style src="./BasicAlerts.css"></style>
