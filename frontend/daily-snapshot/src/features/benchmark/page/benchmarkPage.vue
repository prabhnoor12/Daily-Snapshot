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
import * as Dashboard from '../component/Dashboard.vue';
import * as Metrics from '../component/Metrics.vue';
import * as Trend_Detection from '../component/Trend_Detection.vue';
import * as Correlation_Analysis from '../component/Correlation_Analysis.vue';
import * as Historial_comparison from '../component/Historial_comparison.vue';
import * as Milestone_comparison from '../component/Milestone_comparison.vue';
import * as Segmented from '../component/Segmented.vue';
import * as Auto_Recommendations from '../component/Auto_Recommendations.vue';
import * as Warnings from '../component/Warnings.vue';
import * as ExportButton from '../component/ExportButton.vue';
import './benchmarkPage.css';
// Example: shopId could come from route, store, or props
const shopId = ref(1);
</script>



