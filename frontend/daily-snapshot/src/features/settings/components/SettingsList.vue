<template>
  <div class="settings-list">
    <h2>User Settings</h2>
    <div v-if="loading" class="settings-loading">Loading...</div>
    <div v-else>
      <div v-if="settings && Object.keys(settings).length">
        <ul>
          <li v-for="(value, key) in settings" :key="key">
            <span class="setting-key">{{ key }}</span>
            <span class="setting-value">{{ value }}</span>
          </li>
        </ul>
      </div>
      <div v-else class="settings-empty">No settings found.</div>
    </div>
    <button class="settings-btn" @click="$emit('refresh')">Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { getSettings } from '../../../api/settingApi';

const props = defineProps<{ userId: number }>();
const settings = ref<Record<string, any>>({});
const loading = ref(false);

async function fetchSettings() {
  loading.value = true;
  try {
    const res = await getSettings(props.userId);
    settings.value = res.data;
  } catch (e) {
    settings.value = {};
  } finally {
    loading.value = false;
  }
}

watch(() => props.userId, fetchSettings, { immediate: true });

defineExpose({ fetchSettings });
</script>

<style src="./SettingsList.css"></style>
