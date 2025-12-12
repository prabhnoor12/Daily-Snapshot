<template>
	<section class="correlation-analysis" aria-labelledby="correlation-analysis-title">
		<h3 id="correlation-analysis-title">Correlation Analysis</h3>
		<div v-if="loading" class="correlation-loading" role="status" aria-live="polite">
			<span class="spinner" aria-hidden="true"></span> Loading...
		</div>
		<div v-else-if="error" class="correlation-error" role="alert">
			{{ error }}
			<button @click="fetchCorrelation" class="retry-btn">Retry</button>
		</div>
		<div v-else-if="isEmpty" class="correlation-empty" role="status">
			No correlation data available.
		</div>
		<table v-else class="correlation-table">
			<thead>
				<tr>
					<th>Metric Pair</th>
					<th>Correlation</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(value, key) in correlation" :key="key">
					<td>{{ key }}</td>
					<td>{{ value !== null ? value.toFixed(3) : 'N/A' }}</td>
				</tr>
			</tbody>
		</table>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getCorrelation } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();

interface CorrelationData {
	[key: string]: number | null;
}

const correlation = ref<CorrelationData>({});
const loading = ref(false);
const error = ref<string | null>(null);

const isEmpty = computed(() => Object.keys(correlation.value).length === 0);


function sanitizeError(err: any): string {
	const msg = err?.message || err?.toString() || '';
	if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
		return 'Failed to load correlation data (server error).';
	}
	return msg || 'Failed to load correlation data.';
}

async function fetchCorrelation() {
	loading.value = true;
	error.value = null;
	try {
		const result = await getCorrelation(props.shopId);
		if (result && typeof result === 'object' && !Array.isArray(result)) {
			correlation.value = result;
		} else {
			error.value = 'No valid correlation data received.';
			correlation.value = {};
		}
	} catch (e: any) {
		error.value = sanitizeError(e);
		correlation.value = {};
	} finally {
		loading.value = false;
	}
}

onMounted(fetchCorrelation);
</script>
<style scoped>
.correlation-analysis {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	padding: 1.5rem;
	margin: 1rem 0;
}
.correlation-analysis h3 {
	margin-bottom: 1rem;
}
.correlation-loading {
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
.correlation-error {
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
.correlation-empty {
	color: #888;
	font-style: italic;
}
.correlation-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 1rem;
}
.correlation-table th, .correlation-table td {
	border: 1px solid #eee;
	padding: 0.5rem 1rem;
	text-align: left;
}
.correlation-table th {
	background: #f7f7f7;
}
</style>
