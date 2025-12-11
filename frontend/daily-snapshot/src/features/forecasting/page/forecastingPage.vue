<template>
  <div class="forecasting-page">
    <h2 class="page-title">Sales Forecasting Dashboard</h2>
    <div class="forecasting-components">
      <SalesForecast :shopId="shopId" />
      <SalesExpSmoothing :shopId="shopId" />
      <SalesArima :shopId="shopId" />
      <SalesTrend :shopId="shopId" />
      <SalesWarnings :shopId="shopId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SalesForecast from '../components/SalesForecast.vue';
import SalesExpSmoothing from '../components/SalesExpSmoothing.vue';
import SalesArima from '../components/SalesArima.vue';
import SalesTrend from '../components/SalesTrend.vue';
import SalesWarnings from '../components/SalesWarnings.vue';
import './forecastingPage.css';
// Example: shopId could come from route, store, or props
const shopId = ref(1);
</script>

<style scoped>
.forecasting-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: #2563eb;
}
.forecasting-components {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
