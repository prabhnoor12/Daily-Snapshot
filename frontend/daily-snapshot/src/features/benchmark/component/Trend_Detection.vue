<template>
	<div>
		<h3>Trend Detection</h3>
		<div v-if="loading">Loading...</div>
		<div v-else-if="error">{{ error }}</div>
		<div v-else>
			<div v-if="summary">
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
			</div>
			<div v-else>
				<em>No trend data available.</em>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSummary } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();
const summary = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
	loading.value = true;
	try {
		summary.value = await getSummary(props.shopId);
	} catch (e: any) {
		error.value = e?.message || 'Failed to load trend data.';
	} finally {
		loading.value = false;
	}
});
</script>
import './Trend_Detection.css';
