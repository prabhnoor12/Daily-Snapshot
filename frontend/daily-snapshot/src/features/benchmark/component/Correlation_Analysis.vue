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
		<div v-else>
			<Charts
				type="bar"
				:data="{
					labels: Object.keys(correlation),
					datasets: [
						{
							label: 'Correlation',
							data: Object.values(correlation).map(v => v ?? 0),
							backgroundColor: '#17a2b8',
						}
					]
				}"
				:options="{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: -1, max: 1 } } }"
			/>
			<table class="correlation-table">
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
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getCorrelation } from '../../../api/benchmarkApi';
import Charts from './Charts.vue';

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
		const result = await getCorrelation(String(props.shopId));
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
