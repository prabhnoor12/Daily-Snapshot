<style src="./analyticsCard.css"></style>

<template>
	<div class="analytics-card" role="region" aria-labelledby="realtime-visitors-title">
		<h3 id="realtime-visitors-title">Real-Time Visitor Count</h3>
		<div class="card-subtitle">See how many visitors are active on your store right now.</div>
		<div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
		<div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
		<div v-else-if="visitors !== null">
			<BaseLineChart
				v-if="visitorTrend.length > 1"
				:labels="visitorTrendLabels"
				:datasets="[{ label: 'Visitors', data: visitorTrend, borderColor: '#235390', backgroundColor: '#235390' }]"
				y-label="Visitors"
				title="Visitor Trend (Live)"
				style="margin-bottom: 1.2rem; height: 180px;"
			/>
			<span class="visitor-count" aria-live="polite">{{ visitors }}</span>
		</div>
		<div v-else class="analytics-empty">No data available.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getRealTimeVisitorCount } from '../../../api/analyticsApi';
import BaseLineChart from './BaseLineChart.vue';

const props = defineProps({
	shopId: {
		type: Number,
		required: true
	}
});
const visitors = ref<number|null>(null);
const loading = ref(false);
const error = ref('');
const visitorTrend = ref<number[]>([]);
const visitorTrendLabels = ref<string[]>([]);

async function fetchVisitors() {
	loading.value = true;
	error.value = '';
	try {
		const res = await getRealTimeVisitorCount(props.shopId);
		let v = res?.data ?? res;
		if (typeof v === 'object' && v !== null && 'live_visitors' in v) {
			visitors.value = v.live_visitors;
			if (Array.isArray(v.trend) && Array.isArray(v.trendLabels)) {
				visitorTrend.value = v.trend;
				visitorTrendLabels.value = v.trendLabels;
			} else {
				visitorTrend.value = [v.live_visitors];
				visitorTrendLabels.value = ['Now'];
			}
		} else if (typeof v === 'number') {
			visitors.value = v;
			visitorTrend.value = [v];
			visitorTrendLabels.value = ['Now'];
		} else {
			throw new Error('Unexpected response format.');
		}
	} catch (e: any) {
		error.value = e?.message || 'Failed to fetch visitor count.';
		visitors.value = null;
		visitorTrend.value = [];
		visitorTrendLabels.value = [];
	} finally {
		loading.value = false;
	}
}

watch(() => props.shopId, fetchVisitors, { immediate: true });
</script>

