<template>
  <div class="benchmark-page">
    <h2 class="page-title">Benchmarking Dashboard</h2>
    <div class="benchmark-components">
      <Dashboard :shopId="shopId" />
      <Metrics :shopId="shopId" />
      <Trend_Detection :shopId="shopId" />
      <Correlation_Analysis :shopId="shopId" />
      <Historial_comparison :shopId="shopId" />
      <Milestone_comparison :shopId="shopId" />
      <Segmented :shopId="shopId" />
      <Auto_Recommendations :shopId="shopId" />
      <Warnings :shopId="shopId" />
      <ExportButton :shopId="shopId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dashboard from '../component/Dashboard.vue';
import Metrics from '../component/Metrics.vue';
import Trend_Detection from '../component/Trend_Detection.vue';
import Correlation_Analysis from '../component/Correlation_Analysis.vue';
import Historial_comparison from '../component/Historial_comparison.vue';
import Milestone_comparison from '../component/Milestone_comparison.vue';
import Segmented from '../component/Segmented.vue';
import Auto_Recommendations from '../component/Auto_Recommendations.vue';
import Warnings from '../component/Warnings.vue';
import ExportButton from '../component/ExportButton.vue';
import './benchmarkPage.css';
// Example: shopId could come from route, store, or props
const shopId = ref(1);
</script>



