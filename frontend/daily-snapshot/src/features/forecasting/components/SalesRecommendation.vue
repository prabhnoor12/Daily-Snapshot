<template>
  <div class="sales-recommendation">
    <h3>Sales Recommendation</h3>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <strong>{{ recommendation }}</strong>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSalesRecommendation } from '../../../api/forecastingApi';
import './SalesRecommendation.css';

const props = defineProps<{ shopId: number, segment?: string }>();
const recommendation = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    recommendation.value = await getSalesRecommendation(props.shopId.toString(), props.segment);
  } catch (e: any) {
    error.value = e?.message || 'Failed to load recommendation.';
  } finally {
    loading.value = false;
  }
});
</script>
