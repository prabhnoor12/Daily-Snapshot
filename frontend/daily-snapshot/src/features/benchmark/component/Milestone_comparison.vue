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
				<div v-for="(metrics, milestone) in milestones" :key="milestone" class="milestone-block">
					<h4>{{ String(milestone).replace('_', ' ').toUpperCase() }}</h4>
					<ul>
						<li v-for="(value, key) in metrics" :key="key">
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
import { getMilestones } from '../../../api/benchmarkApi';

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
		const result = await getMilestones(props.shopId);
		if (result && typeof result === 'object' && !Array.isArray(result)) {
			milestones.value = result;
		} else {
			error.value = 'No valid milestone data received.';
			milestones.value = {};
		}
	} catch (e: any) {
		error.value = sanitizeError(e);
		milestones.value = {};
	} finally {
		loading.value = false;
	}
}

onMounted(fetchMilestones);
</script>
<style scoped>
.milestone-comparison {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	padding: 1.5rem;
	margin: 1rem 0;
}
.milestone-comparison h3 {
	margin-bottom: 1rem;
}
.milestone-loading {
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
.milestone-error {
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
.milestone-empty {
	color: #888;
	font-style: italic;
}
.milestone-block {
	margin-bottom: 1.5rem;
	padding: 1rem;
	border: 1px solid #eee;
	border-radius: 6px;
	background: #fafbfc;
}
.milestone-block h4 {
	margin-bottom: 0.5rem;
	font-size: 1.1em;
}
.milestone-block ul {
	margin: 0;
	padding-left: 1.25rem;
}
.milestone-block li {
	margin-bottom: 0.4rem;
}
</style>
