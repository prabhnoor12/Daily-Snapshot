
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
				<div v-for="(segment, name) in segmentation" :key="name" class="segment-block">
					<h4>{{ name }}</h4>
					<ul>
						<li v-for="(value, key) in segment" :key="key">
							<strong>{{ key }}:</strong> {{ value }}
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getSegmentation } from '../../../api/benchmarkApi';

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
		const result = await getSegmentation(props.shopId);
		if (result && typeof result === 'object' && !Array.isArray(result)) {
			segmentation.value = result;
		} else {
			error.value = 'No valid segmentation data received.';
			segmentation.value = {};
		}
	} catch (e: any) {
		error.value = sanitizeError(e);
		segmentation.value = {};
	} finally {
		loading.value = false;
	}
}

onMounted(fetchSegmentation);
</script>
<style scoped>
.segmented-section {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	padding: 1.5rem;
	margin: 1rem 0;
}
.segmented-section h3 {
	margin-bottom: 1rem;
}
.segmented-loading {
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
.segmented-error {
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
.segmented-empty {
	color: #888;
	font-style: italic;
}
.segment-block {
	margin-bottom: 1.5rem;
	padding: 1rem;
	border: 1px solid #eee;
	border-radius: 6px;
	background: #fafbfc;
}
.segment-block h4 {
	margin-bottom: 0.5rem;
	font-size: 1.1em;
}
.segment-block ul {
	margin: 0;
	padding-left: 1.25rem;
}
.segment-block li {
	margin-bottom: 0.4rem;
}
</style>
