<template>
  <div class="settings-bulk-update">
    <h3>Bulk Update Settings</h3>
    <form @submit.prevent="submitBulkUpdate">
      <textarea v-model="settingsJson" class="settings-textarea" rows="6" placeholder="Paste settings JSON here..."></textarea>
      <div class="settings-bulk-actions">
        <label>
          <input type="checkbox" v-model="transactional" /> Transactional
        </label>
        <button class="settings-btn" type="submit">Update</button>
      </div>
    </form>
    <div v-if="message" class="settings-message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { bulkUpdateSettings } from '../../../api/settingApi';

const props = defineProps<{ userId: number }>();
const settingsJson = ref('');
const transactional = ref(false);
const message = ref('');

async function submitBulkUpdate() {
  message.value = '';
  let settingsObj;
  try {
    settingsObj = JSON.parse(settingsJson.value);
  } catch {
    message.value = 'Invalid JSON.';
    return;
  }
  try {
    await bulkUpdateSettings(props.userId, settingsObj, transactional.value);
    message.value = 'Settings updated successfully.';
  } catch {
    message.value = 'Failed to update settings.';
  }
}
</script>

<style src="./SettingsBulkUpdate.css"></style>
