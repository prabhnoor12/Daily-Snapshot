<template>
	<div>
		<h3>Correlation Analysis</h3>
		<div v-if="loading">Loading...</div>
		<div v-else-if="error">{{ error }}</div>
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
	</div>
</template>

<script setup lang="ts">
import './Correlation_Analysis.css';
import { ref, onMounted } from 'vue';
import { getCorrelation } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();
const correlation = ref<Record<string, number | null>>({});
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
	loading.value = true;
	try {
		correlation.value = await getCorrelation(props.shopId);
	} catch (e: any) {
		error.value = e?.message || 'Failed to load correlation data.';
	} finally {
		loading.value = false;
	}
});
</script>
