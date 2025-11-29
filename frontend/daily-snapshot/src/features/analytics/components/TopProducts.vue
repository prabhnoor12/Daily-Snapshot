
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

</template>
<template>
	<div class="analytics-card" role="region" aria-labelledby="top-products-title">
		<h3 id="top-products-title">Top Products of the Day</h3>
		<div class="card-subtitle">See which products are leading in sales and orders today.</div>
		<div v-if="loading" class="analytics-loading" aria-busy="true">Loading...</div>
		<div v-else-if="error" class="analytics-error" role="alert">{{ error }}</div>
		<ul v-else-if="products.length" class="top-products-list">
			<li v-for="product in products" :key="product.product" class="top-product-item">
				<span class="product-name">{{ product.product }}</span>
				<span class="product-value">Sales: {{ product.sales ?? '-' }}, Orders: {{ product.orders ?? '-' }}</span>
			</li>
		</ul>
		<div v-else class="analytics-empty">No data available.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getTopProductsOfDay } from '../../../api/analyticsApi';

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

