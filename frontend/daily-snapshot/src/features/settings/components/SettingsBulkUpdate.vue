<template>
  <div class="settings-bulk-update">
    <h3>Bulk Update Settings</h3>
    <form @submit.prevent="submitBulkUpdate">
      <div class="settings-form-row">
        <label class="settings-label">Theme</label>
        <select v-model="form.theme" class="settings-input">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div class="settings-form-row">
        <label class="settings-label">Notifications</label>
        <input type="checkbox" v-model="form.notifications" class="settings-checkbox-input" />
      </div>
      <div class="settings-form-row">
        <label class="settings-label">Language</label>
        <select v-model="form.language" class="settings-input">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
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
const transactional = ref(false);
const message = ref('');
const form = ref({
  theme: 'light',
  notifications: true,
  language: 'en',
});

async function submitBulkUpdate() {
  message.value = '';
  try {
    await bulkUpdateSettings(props.userId, {
      theme: form.value.theme,
      notifications: form.value.notifications,
      language: form.value.language,
    }, transactional.value);
    message.value = 'Settings updated successfully.';
  } catch {
    message.value = 'Failed to update settings.';
  }
}
</script>

<style src="./SettingsBulkUpdate.css"></style>
