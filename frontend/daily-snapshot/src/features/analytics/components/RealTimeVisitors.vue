<style src="./analyticsCard.css"></style>

<template>
	<div class="analytics-card">
		<h3>Real-Time Visitor Count</h3>
		<div class="card-subtitle">See how many visitors are active on your store right now.</div>
		<div v-if="loading" class="analytics-loading">Loading...</div>
		<div v-else-if="error" class="analytics-error">{{ error }}</div>
		<div v-else-if="visitors !== null">
			<span class="visitor-count" style="font-size: 1.5rem; font-weight: 700; color: #235390;">{{ visitors }}</span>
		</div>
		<div v-else class="analytics-empty">No data available.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getRealTimeVisitorCount } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number }>();
const visitors = ref<number|null>(null);
const loading = ref(false);
const error = ref('');

async function fetchVisitors() {
	loading.value = true;
	error.value = '';
	try {
		const res = await getRealTimeVisitorCount(props.shopId);
		// API may return { live_visitors: number } or just a number
		visitors.value = typeof res === 'object' && res !== null && 'live_visitors' in res ? res.live_visitors : res;
	} catch (e: any) {
		error.value = 'Failed to fetch visitor count.';
		visitors.value = null;
	} finally {
		loading.value = false;
	}
}

watch(() => props.shopId, fetchVisitors, { immediate: true });
</script>

