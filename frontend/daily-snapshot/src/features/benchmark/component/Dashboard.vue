<template>
	<section class="dashboard-section" aria-labelledby="dashboard-title">
		<h3 id="dashboard-title">Benchmarking Dashboard Overview</h3>
		<div v-if="loading" class="dashboard-loading" role="status" aria-live="polite">
			<span class="spinner" aria-hidden="true"></span> Loading dashboard...
		</div>
		<div v-else-if="error" class="dashboard-error" role="alert">
			{{ error }}
			<button @click="fetchDashboard" class="retry-btn">Retry</button>
		</div>
		<div v-else-if="isEmpty" class="dashboard-empty" role="status">
			No dashboard data available.
		</div>
		<div v-else class="dashboard-content">
			<ul class="dashboard-list">
				<li v-for="(value, key) in dashboard" :key="key">
					<strong>{{ key }}:</strong> {{ value }}
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getDashboard } from '../../../api/benchmarkApi';

const props = defineProps<{ shopId: number }>();

interface DashboardData {
	[key: string]: string | number | null;
}

const dashboard = ref<DashboardData>({});
const loading = ref(false);
const error = ref<string | null>(null);

const isEmpty = computed(() => Object.keys(dashboard.value).length === 0);

function sanitizeError(err: any): string {
	const msg = err?.message || err?.toString() || '';
	if (typeof msg === 'string' && /<\/?[a-z][\s\S]*>/i.test(msg)) {
		return 'Failed to load dashboard (server error).';
	}
	return msg || 'Failed to load dashboard.';
}

async function fetchDashboard() {
	   loading.value = true;
	   error.value = null;
	   try {
		   const result = await getDashboard(props.shopId);
		   // Only accept plain objects (not arrays, not strings)
		   if (result && typeof result === 'object' && !Array.isArray(result)) {
			   dashboard.value = result;
		   } else {
			   error.value = 'No valid dashboard data received.';
			   dashboard.value = {};
		   }
	   } catch (e: any) {
		   error.value = sanitizeError(e);
		   dashboard.value = {};
	   } finally {
		   loading.value = false;
	   }
}

onMounted(fetchDashboard);
</script>

<style scoped>
.dashboard-section {
	margin-bottom: 2rem;
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	padding: 1.5rem;
}
.dashboard-loading,
.dashboard-error,
.dashboard-empty {
	margin: 1rem 0;
	color: #888;
}
.dashboard-error {
	color: #c00;
}
.dashboard-list {
	list-style: none;
	padding: 0;
}
.dashboard-list li {
	margin-bottom: 0.5rem;
}
.retry-btn {
	margin-left: 1rem;
	background: #f5f5f5;
	border: 1px solid #ccc;
	border-radius: 4px;
	padding: 0.25rem 0.75rem;
	cursor: pointer;
}
</style>
