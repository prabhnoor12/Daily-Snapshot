<template>
	<div>
		<h3>Automated Recommendations</h3>
		<ul v-if="recommendations.length" class="recommendations-list">
			<li v-for="(rec, idx) in recommendations" :key="idx">{{ rec }}</li>
		</ul>
		<div v-else>
			<em>No recommendations available.</em>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRecommendations } from '../../../api/benchmarkApi';
import './Auto_Recommendations.css';

const props = defineProps<{ shopId: number }>();
const recommendations = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
	loading.value = true;
	try {
		recommendations.value = await getRecommendations(props.shopId);
	} catch (e: any) {
		error.value = e?.message || 'Failed to load recommendations.';
	} finally {
		loading.value = false;
	}
});
</script>
