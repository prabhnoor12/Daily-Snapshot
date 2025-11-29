
<style src="./analyticsCard.css"></style>
<style scoped>
.top-products-list {
	margin-bottom: 1.1rem;
	padding: 0;
	list-style: none;
}
.top-product-item {
	background: #f6f8fa;
	padding: 0.4rem 0.2rem;
	border-radius: 6px;
	margin-bottom: 0.2rem;
	display: flex;
	align-items: center;
	transition: background 0.15s;
}
.top-product-item:nth-child(odd) {
	background: #fff;
}
.product-name {
	font-weight: 600;
}
.product-value {
	margin-left: 0.7rem;
	color: #4a6fa1;
}
</style>

<template>
	<div class="analytics-card" role="region" aria-labelledby="top-products-title">
		<h3 id="top-products-title">Top Products of the Day</h3>
		<div class="card-subtitle">See which products are leading in sales and orders today.</div>
		<div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
		<div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
		<template v-else-if="products.length">
			<BaseBarChart
				:labels="products.map(p => p.product)"
				:datasets="barChartDatasets"
				y-label="Count"
				title="Top Products: Sales & Orders"
				style="margin-bottom: 1.5rem;"
			/>
			<ul class="top-products-list">
				<li v-for="product in products" :key="product.product" class="top-product-item">
					<span class="product-name">{{ product.product }}</span>
					<span class="product-value">Sales: {{ product.sales ?? '-' }}, Orders: {{ product.orders ?? '-' }}</span>
				</li>
			</ul>
		</template>
		<div v-else class="analytics-empty">No data available.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getTopProductsOfDay } from '../../../api/analyticsApi';
import BaseBarChart from './BaseBarChart.vue';

const props = defineProps({
	shopId: {
		type: Number,
		required: true
	},
	topN: {
		type: Number,
		default: 3,
		validator: (v: number) => v > 0 && v <= 20
	}
});
const products = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

const barChartDatasets = computed(() => {
	if (!products.value.length) return [];
	return [
		{
			label: 'Sales',
			data: products.value.map(p => p.sales ?? 0),
			backgroundColor: '#235390',
		},
		{
			label: 'Orders',
			data: products.value.map(p => p.orders ?? 0),
			backgroundColor: '#2a8c4a',
		},
	];
});

async function fetchProducts() {
	loading.value = true;
	error.value = '';
	try {
		const res = await getTopProductsOfDay(props.shopId, props.topN);
		let arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
		if (!Array.isArray(arr)) {
			throw new Error('Unexpected response format.');
		}
		// Defensive: filter out invalid product objects
		products.value = arr.filter(p => p && typeof p.product === 'string');
	} catch (e: any) {
		error.value = e?.message || 'Failed to fetch products.';
		products.value = [];
	} finally {
		loading.value = false;
	}
}

watch(() => [props.shopId, props.topN], fetchProducts, { immediate: true });
</script>

