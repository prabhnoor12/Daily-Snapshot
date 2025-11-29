
<template>
	<div class="analytics-card">
		<h3>Top Products of the Day</h3>
		<div v-if="loading" class="analytics-loading">Loading...</div>
		<div v-else-if="error" class="analytics-error">{{ error }}</div>
		<div v-else-if="products.length">
			<ul>
				<li v-for="product in products" :key="product.product">
					<span class="product-name">{{ product.product }}</span>
					<span class="product-value">Sales: {{ product.sales ?? '-' }}, Orders: {{ product.orders ?? '-' }}</span>
				</li>
			</ul>
		</div>
		<div v-else class="analytics-empty">No data available.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getTopProductsOfDay } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number; topN?: number }>();
const products = ref<any[]>([]);
const loading = ref(false);
const error = ref('');


async function fetchProducts() {
	loading.value = true;
	error.value = '';
	try {
		const res = await getTopProductsOfDay(props.shopId, props.topN || 3);
		// Handle both { data: [...] } and [...] directly
		let arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
		products.value = arr;
		if (!Array.isArray(arr)) {
			error.value = 'Unexpected response format.';
			products.value = [];
		}
	} catch (e: any) {
		error.value = 'Failed to fetch products.';
		products.value = [];
	} finally {
		loading.value = false;
	}
}

watch(() => [props.shopId, props.topN], fetchProducts, { immediate: true });
</script>

