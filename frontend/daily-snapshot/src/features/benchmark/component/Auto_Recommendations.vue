<template>
	<section class="auto-recommendations" aria-labelledby="auto-recommendations-title">
		<h3 id="auto-recommendations-title">Automated Recommendations</h3>
		<div v-if="loading" class="recommendations-loading" role="status" aria-live="polite">
			<span class="spinner" aria-hidden="true"></span> Loading...
		</div>
		<div v-else-if="error" class="recommendations-error" role="alert">
			{{ error }}
			<button @click="fetchRecommendations" class="retry-btn">Retry</button>
		</div>
		<ul v-else-if="recommendations.length" class="recommendations-list">
			<li v-for="(rec, idx) in recommendations" :key="idx">{{ rec }}</li>
		</ul>
		<div v-else class="recommendations-empty" role="status">
			<em>No recommendations available.</em>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRecommendations } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();
const recommendations = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);


function sanitizeError(err: any): string {
	const msg = err?.message || err?.toString() || '';
	if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
		return 'Failed to load recommendations (server error).';
	}
	return msg || 'Failed to load recommendations.';
}

async function fetchRecommendations() {
	loading.value = true;
	error.value = null;
	try {
		const result = await getRecommendations(props.shopId);
		if (Array.isArray(result)) {
			recommendations.value = result;
		} else {
			error.value = 'No valid recommendations data received.';
			recommendations.value = [];
		}
	} catch (e: any) {
		error.value = sanitizeError(e);
		recommendations.value = [];
	} finally {
		loading.value = false;
	}
}

onMounted(fetchRecommendations);
</script>
<style scoped>
.auto-recommendations {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	padding: 1.5rem;
	margin: 1rem 0;
}
.auto-recommendations h3 {
	margin-bottom: 1rem;
}
.recommendations-loading {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #888;
}
.spinner {
	width: 1em;
	height: 1em;
	border: 2px solid #ccc;
	border-top: 2px solid #007bff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	display: inline-block;
}
@keyframes spin {
	to { transform: rotate(360deg); }
}
.recommendations-error {
	color: #b00020;
	margin-bottom: 1rem;
}
.retry-btn {
	margin-left: 1rem;
	background: #007bff;
	color: #fff;
	border: none;
	border-radius: 4px;
	padding: 0.25rem 0.75rem;
	cursor: pointer;
	font-size: 0.95em;
}
.retry-btn:hover {
	background: #0056b3;
}
.recommendations-empty {
	color: #888;
	font-style: italic;
}
.recommendations-list {
	margin: 0;
	padding-left: 1.25rem;
}
.recommendations-list li {
	margin-bottom: 0.5rem;
}
</style>
