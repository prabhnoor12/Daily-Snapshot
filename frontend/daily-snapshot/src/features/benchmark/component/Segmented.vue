
<template>
	<section class="segmented-section" aria-labelledby="segmented-title">
		<h3 id="segmented-title">Segmented Benchmarking</h3>
		<div v-if="loading" class="segmented-loading" role="status" aria-live="polite">
			<span class="spinner" aria-hidden="true"></span> Loading...
		</div>
		<div v-else-if="error" class="segmented-error" role="alert">
			{{ error }}
			<button @click="fetchSegmentation" class="retry-btn">Retry</button>
		</div>
		<div v-else>
			<div v-if="isEmpty" class="segmented-empty" role="status">
				<em>No segmentation data available.</em>
			</div>
			<div v-else>
				<!-- Existing segment blocks -->
				<div v-for="(segment, name) in segmentation" :key="name" class="segment-block">
					<h4>{{ name }}</h4>
					<ul>
						<li v-for="(value, key) in segment" :key="key">
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
import { getSegmentation } from '../../../api/benchmarkApi';
import Charts from './Charts.vue';

const props = defineProps<{ shopId: number }>();

interface SegmentData {
  [key: string]: string | number | null;
}
interface SegmentationData {
  [segment: string]: SegmentData;
}

const segmentation = ref<SegmentationData>({});
const loading = ref(false);
const error = ref<string | null>(null);

const isEmpty = computed(() => Object.keys(segmentation.value).length === 0);

// Prepare chart data from segmentation
const chartData = computed(() => {
	const seg = segmentation.value;
	if (!seg || Object.keys(seg).length === 0) return { labels: [], datasets: [] };
	// Collect all unique metric keys
	const metricKeys = Array.from(new Set(Object.values(seg).flatMap(obj => Object.keys(obj))));
	const labels = Object.keys(seg);
	// For each metric, create a dataset
	const datasets = metricKeys.map((metric, idx) => ({
		label: metric,
		backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 60%)`,
		data: labels.map((segmentName) => {
			const value = seg[segmentName]?.[metric];
			return typeof value === 'number' ? value : (parseFloat(value as string) || 0);
		})
	}));
	return { labels, datasets };
});

const chartOptions = {
	responsive: true,
	plugins: {
		legend: { display: true },
		title: { display: true, text: 'Segmented Benchmarking Metrics' }
	},
	scales: {
		y: { beginAtZero: true }
	}
};


function sanitizeError(err: any): string {
	const msg = err?.message || err?.toString() || '';
	if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
		return 'Failed to load segmentation data (server error).';
	}
	return msg || 'Failed to load segmentation data.';
}

async function fetchSegmentation() {
	loading.value = true;
	error.value = null;
	try {
		const data = await getSegmentation(props.shopId);
		segmentation.value = data;
	} catch (err) {
		error.value = sanitizeError(err);
	} finally {
		loading.value = false;
	}
}	onMounted(fetchSegmentation);
</script>
<style scoped>
.segmented-section {
  margin-bottom: 2rem;
}	</style>
