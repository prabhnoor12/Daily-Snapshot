<style src="./analyticsCard.css"></style>

<template>
	<div class="analytics-card">
		<h3>Top Products of the Day</h3>
		<div class="card-subtitle">See which products are leading in sales and orders today.</div>
		<div v-if="loading" class="analytics-loading">Loading...</div>
		<div v-else-if="error" class="analytics-error">{{ error }}</div>
		<div v-else-if="products.length">
			<ul style="margin-bottom: 1.1rem;">
				<li v-for="(product, idx) in products" :key="product.product" :style="{ background: idx % 2 === 0 ? '#f6f8fa' : 'transparent', padding: '0.4rem 0.2rem', borderRadius: '6px', marginBottom: '0.2rem' }">
					<span class="product-name" style="font-weight: 600;">{{ product.product }}</span>
					<span class="product-value" style="margin-left: 0.7rem; color: #4a6fa1;">Sales: {{ product.sales ?? '-' }}, Orders: {{ product.orders ?? '-' }}</span>
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

