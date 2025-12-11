<template>
	<div>
		<h3>Milestone Comparison</h3>
		<div v-if="loading">Loading...</div>
		<div v-else-if="error">{{ error }}</div>
		<div v-else>
			<div v-if="Object.keys(milestones).length">
				<div v-for="(metrics, milestone) in milestones" :key="milestone" class="milestone-block">
					<h4>{{ milestone.replace('_', ' ').toUpperCase() }}</h4>
					<ul>
						<li v-for="(value, key) in metrics" :key="key">
							<strong>{{ key }}:</strong> {{ value }}
						</li>
					</ul>
				</div>
			</div>
			<div v-else>
				<em>No milestone data available.</em>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMilestones } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();
const milestones = ref<Record<string, Record<string, any>>>({});
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
	loading.value = true;
	try {
		milestones.value = await getMilestones(props.shopId);
	} catch (e: any) {
		error.value = e?.message || 'Failed to load milestone data.';
	} finally {
		loading.value = false;
	}
});
	import './Milestone_comparison.css';
</script>
