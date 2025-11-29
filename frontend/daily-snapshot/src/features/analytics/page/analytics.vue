

<template>
  <div class="analytics-page-container">
    <h1 class="analytics-title">Analytics Dashboard</h1>
    <div class="analytics-subheading">Your daily business insights at a glance</div>
    <div class="analytics-components-list">
      <DayOverDay :shopId="shopId" />
      <SevenDayTrends :shopId="shopId" />
      <TopProducts :shopId="shopId" />
      <OrderStatusBreakdown :shopId="shopId" />
      <RealTimeVisitors :shopId="shopId" />
      <AverageOrderValue :shopId="shopId" />
      <ExportSnapshot :shopId="shopId" />
      <CustomDashboard :shopId="shopId" />
      <BasicAlerts :shopId="shopId" />
      <MobileDashboard :shopId="shopId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import "./analytics.css";
import DayOverDay from "../components/DayOverDay.vue";
import SevenDayTrends from "../components/SevenDayTrends.vue";
import TopProducts from "../components/TopProducts.vue";
import OrderStatusBreakdown from "../components/OrderStatusBreakdown.vue";
import RealTimeVisitors from "../components/RealTimeVisitors.vue";
import AverageOrderValue from "../components/AverageOrderValue.vue";
import ExportSnapshot from "../components/ExportSnapshot.vue";
import CustomDashboard from "../components/CustomDashboard.vue";
import BasicAlerts from "../components/BasicAlerts.vue";
import MobileDashboard from "../components/MobileDashboard.vue";
// TODO: Replace with real shopId from auth/session
const shopId = 1;
</script>
