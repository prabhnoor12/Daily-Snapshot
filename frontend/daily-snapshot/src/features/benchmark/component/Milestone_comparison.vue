<template>
	<section class="milestone-comparison" aria-labelledby="milestone-comparison-title">
		<h3 id="milestone-comparison-title">Milestone Comparison</h3>
		<div v-if="loading" class="milestone-loading" role="status" aria-live="polite">
			<span class="spinner" aria-hidden="true"></span> Loading...
		</div>
		<div v-else-if="error" class="milestone-error" role="alert">
			{{ error }}
			<button @click="fetchMilestones" class="retry-btn">Retry</button>
		</div>
		<div v-else>
			<div v-if="isEmpty" class="milestone-empty" role="status">
				<em>No milestone data available.</em>
			</div>
			<div v-else>
				<!-- Existing milestone blocks -->
				<div v-for="(metrics, milestone) in milestones" :key="milestone" class="milestone-block">
					<h4>{{ String(milestone).replace('_', ' ').toUpperCase() }}</h4>
					<ul>
						<li v-for="(value, key) in metrics" :key="key">
							<strong>{{ key }}:</strong> {{ value }}
						</li>
					</ul>
				</div>

				<!-- Chart visualization -->
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
import { getMilestones } from '../../../api/benchmarkApi';
import Charts from './Charts.vue';

const props = defineProps<{ shopId: number }>();

interface MilestoneMetrics {
	[key: string]: string | number | null;
}
interface MilestonesData {
	[milestone: string]: MilestoneMetrics;
}

const milestones = ref<MilestonesData>({});
const loading = ref(false);
const error = ref<string | null>(null);

const isEmpty = computed(() => Object.keys(milestones.value).length === 0);

// Prepare chart data from milestones
const chartData = computed(() => {
	const ms = milestones.value;
	if (!ms || Object.keys(ms).length === 0) return { labels: [], datasets: [] };
	// Collect all unique metric keys
	const metricKeys = Array.from(new Set(Object.values(ms).flatMap(obj => Object.keys(obj))));
	const labels = Object.keys(ms).map(milestone => String(milestone).replace('_', ' ').toUpperCase());
	// For each metric, create a dataset
	const datasets = metricKeys.map((metric, idx) => ({
		label: metric,
		backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 60%)`,
		data: labels.map((_, i) => {
			const milestoneKeys = Object.keys(ms);
			const milestoneKey = milestoneKeys[i];
			if (milestoneKey && ms[milestoneKey]) {
				const value = ms[milestoneKey][metric];
				return typeof value === 'number' ? value : (parseFloat(value as string) || 0);
			}
			return 0;
		})
	}));
	return { labels, datasets };
});

const chartOptions = {
	responsive: true,
	plugins: {
		legend: { display: true },
		title: { display: true, text: 'Milestone Metrics Comparison' }
	},
	scales: {
		y: { beginAtZero: true }
	}
};


function sanitizeError(err: any): string {
	const msg = err?.message || err?.toString() || '';
	if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
		return 'Failed to load milestone data (server error).';
	}
	return msg || 'Failed to load milestone data.';
}

async function fetchMilestones() {
	loading.value = true;
	error.value = null;
	try {
		const data = await getMilestones(props.shopId);
		milestones.value = data;
	} catch (err) {
		error.value = sanitizeError(err);
	} finally {
		loading.value = false;
	}
}
onMounted(fetchMilestones);
</script>
<style scoped>
.milestone-comparison {
	padding: 1rem;
	border: 1px solid #ccc;
	border-radius: 4px;
	background-color: #f9f9f9;
}	</style
