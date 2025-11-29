<style src="./analyticsCard.css"></style>

<template>
	<div class="analytics-card">
		<h3>7-Day Trend Charts</h3>
		<div v-if="loading" class="analytics-loading">Loading...</div>
		<div v-else-if="error" class="analytics-error">{{ error }}</div>
		<div v-else-if="data">
			<table class="trend-table">
				<thead>
					<tr>
						<th>Date</th>
						<th>Sales</th>
						<th>Orders</th>
						<th>Visitors</th>
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

const props = defineProps<{ shopId: number }>();
const data = ref<any>(null);
const loading = ref(false);
const error = ref('');

async function fetchData() {
	loading.value = true;
	error.value = '';
	try {
		const res = await get7DayTrendCharts(props.shopId);
		data.value = res;
	} catch (e: any) {
		error.value = 'Failed to fetch data.';
		data.value = null;
	} finally {
		loading.value = false;
	}
}

watch(() => props.shopId, fetchData, { immediate: true });
</script>

