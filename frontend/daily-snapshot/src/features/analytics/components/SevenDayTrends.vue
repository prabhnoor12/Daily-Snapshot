<style src="./analyticsCard.css"></style>

<template>
	<div class="analytics-card" role="region" aria-labelledby="seven-day-trends-title">
		<h3 id="seven-day-trends-title">7-Day Trend Charts</h3>
		<div class="card-subtitle">Track your sales, orders, and visitors over the past week.</div>
		<div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
		<div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
		<div v-else-if="data && Array.isArray(data.dates) && Array.isArray(data.sales) && Array.isArray(data.orders) && Array.isArray(data.visitors) && data.dates.length">
			<table class="trend-table" aria-label="7-day trends">
				<thead>
					<tr>
						<th scope="col">Date</th>
						<th scope="col">Sales</th>
						<th scope="col">Orders</th>
						<th scope="col">Visitors</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(date, idx) in data.dates" :key="date">
						<td>{{ date }}</td>
						<td>{{ data.sales[idx] }}</td>
						<td>{{ data.orders[idx] }}</td>
						<td>{{ data.visitors[idx] }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else class="analytics-empty">No data available.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { get7DayTrendCharts } from '../../../api/analyticsApi';

const props = defineProps({
	shopId: {
		type: Number,
		required: true
	}
});
const data = ref<any>(null);
const loading = ref(false);
const error = ref('');

async function fetchData() {
	loading.value = true;
	error.value = '';
	try {
		const res = await get7DayTrendCharts(props.shopId);
		let d = res?.data || res;
		if (!d || typeof d !== 'object' || !Array.isArray(d.dates) || !Array.isArray(d.sales) || !Array.isArray(d.orders) || !Array.isArray(d.visitors)) {
			throw new Error('Unexpected response format.');
		}
		data.value = d;
	} catch (e: any) {
		error.value = e?.message || 'Failed to fetch data.';
		data.value = null;
	} finally {
		loading.value = false;
	}
}

watch(() => props.shopId, fetchData, { immediate: true });
</script>

