  <div class="analytics-card">
    <h3>Export Daily Snapshot</h3>
    <button @click="exportSnapshot" :disabled="loading">
      {{ loading ? 'Exporting...' : 'Export as CSV' }}
    </button>
    <div v-if="error" class="analytics-error">{{ error }}</div>
    <div v-if="success" class="analytics-success">Exported! Check your downloads.</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { exportDailySnapshot } from '../../../api/analyticsApi';

const props = defineProps<{ shopId: number }>();
const loading = ref(false);
const error = ref('');
const success = ref(false);

async function exportSnapshot() {
  loading.value = true;
  error.value = '';
  success.value = false;
  try {
    // The API returns a blob for CSV
    const res = await exportDailySnapshot(props.shopId, 'csv');
    const blob = new Blob([res], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_snapshot_${props.shopId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    success.value = true;
  } catch (e: any) {
    error.value = 'Export failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<style src="./analyticsCard.css"></style>

<style src="./ExportSnapshot.css"></style>
