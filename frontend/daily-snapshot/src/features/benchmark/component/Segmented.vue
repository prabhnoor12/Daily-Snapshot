<template>
	<div>
		<h3>Segmented Benchmarking</h3>
		<div v-if="loading">Loading...</div>
		<div v-else-if="error">{{ error }}</div>
		<div v-else>
			<div v-if="Object.keys(segmentation).length">
				<div v-for="(segment, name) in segmentation" :key="name" class="segment-block">
					<h4>{{ name }}</h4>
					<ul>
						<li v-for="(value, key) in segment" :key="key">
							<strong>{{ key }}:</strong> {{ value }}
						</li>
					</ul>
				</div>
			</div>
			<div v-else>
				<em>No segmentation data available.</em>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import './Segmented.css';
import { ref, onMounted } from 'vue';
import { getSegmentation } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();
const segmentation = ref<Record<string, Record<string, any>>>({});
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
	loading.value = true;
	try {
		segmentation.value = await getSegmentation(props.shopId);
	} catch (e: any) {
		error.value = e?.message || 'Failed to load segmentation data.';
	} finally {
		loading.value = false;
	}
});
</script>
