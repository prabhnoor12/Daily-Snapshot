<template>
	<section class="historial-comparison" aria-labelledby="historial-comparison-title">
		<h3 id="historial-comparison-title">Historical Milestone Comparison</h3>
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
				<Charts
				  v-if="Object.keys(milestones).length > 0"
				  type="bar"
				  :data="{
					labels: Object.keys((Object.values(milestones)[0] as MilestoneMetrics) || {}),
					datasets: Object.entries(milestones).map(([milestone, metrics], i) => ({
					  label: String(milestone).replace('_', ' ').toUpperCase(),
					  data: Object.values(metrics).map(v => typeof v === 'number' ? v : 0),
					  backgroundColor: `hsl(${i * 60}, 70%, 60%)`
					}))
				  }"
				  :loading="loading"
				  :error="error"
				  :options="{ responsive: true, plugins: { legend: { display: true } } }"
				/>
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
import { ref,  computed } from 'vue';
import { getMilestones } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: string }>();

interface MilestoneMetrics {
	[key: string]: number | string | null;
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
	       const result = await getMilestones(Number(props.shopId));
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

</script>
