
<template>
	<section class="trend-detection-section" aria-labelledby="trend-detection-title">
		<h3 id="trend-detection-title">Trend Detection</h3>
		<div v-if="loading" class="trend-loading" role="status" aria-live="polite">
			<span class="spinner" aria-hidden="true"></span> Loading...
		</div>
		<div v-else-if="error" class="trend-error" role="alert">
			{{ error }}
			<button @click="fetchSummary" class="retry-btn">Retry</button>
		</div>
		<div v-else>
			<div v-if="!summary" class="trend-empty" role="status">
				<em>No trend data available.</em>
			</div>
			<div v-else>
				<div>
					<strong>Improved Metrics:</strong>
					<span v-if="summary.improved_metrics && summary.improved_metrics.length">
						{{ summary.improved_metrics.join(', ') }}
					</span>
					<span v-else>None</span>
				</div>
				<div>
					<strong>Declined Metrics:</strong>
					<span v-if="summary.declined_metrics && summary.declined_metrics.length">
						{{ summary.declined_metrics.join(', ') }}
					</span>
					<span v-else>None</span>
				</div>
				<div>
					<strong>Date Range:</strong>
					<span v-if="summary.date_range && summary.date_range.length">
						{{ summary.date_range[0] }} to {{ summary.date_range[summary.date_range.length - 1] }}
					</span>
				</div>

				<!-- Chart visualization for improved/declined metrics -->
				<Charts
					v-if="chartData && chartData.labels.length > 0"
					type="bar"
					:data="chartData"
					:options="chartOptions"
					:loading="loading"
					:error="error"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getSummary } from '../../../api/benchmarkApi';
import Charts from './Charts.vue';

const props = defineProps<{ shopId: number }>();

interface TrendSummary {
  improved_metrics: string[];
  declined_metrics: string[];
  date_range: string[];
}

const summary = ref<TrendSummary | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Prepare chart data from summary
const chartData = computed(() => {
	if (!summary.value) return { labels: [], datasets: [] };
	const labels = ['Improved', 'Declined'];
	const improvedCount = summary.value.improved_metrics?.length || 0;
	const declinedCount = summary.value.declined_metrics?.length || 0;
	return {
		labels,
		datasets: [
			{
				label: 'Metric Count',
				backgroundColor: ['#4caf50', '#f44336'],
				data: [improvedCount, declinedCount]
			}
		]
	};
});

const chartOptions = {
	responsive: true,
	plugins: {
		legend: { display: false },
		title: { display: true, text: 'Improved vs Declined Metrics' }
	},
	scales: {
		y: { beginAtZero: true, stepSize: 1 }
	}
};


function sanitizeError(err: any): string {
	const msg = err?.message || err?.toString() || '';
	if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
		return 'Failed to load trend data (server error).';
	}
	return msg || 'Failed to load trend data.';
}

async function fetchSummary() {
	loading.value = true;
	error.value = null;
	try {
		const result = await getSummary(String(props.shopId));
		if (result && typeof result === 'object' && !Array.isArray(result)) {
			summary.value = result;
		} else {
			error.value = 'No valid trend summary data received.';
			summary.value = null;
		}
	} catch (e: any) {
		error.value = sanitizeError(e);
		summary.value = null;
	} finally {
		loading.value = false;
	}
}

onMounted(fetchSummary);
</script>
<style scoped>
.trend-detection-section {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	padding: 1.5rem;
	margin: 1rem 0;
}
.trend-detection-section h3 {
	margin-bottom: 1rem;
}
.trend-loading {
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
.trend-error {
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
}
.retry-btn:hover {
	background: #0056b3;
}
.trend-empty {
	font-style: italic;
	color: #666;
}
</style>
