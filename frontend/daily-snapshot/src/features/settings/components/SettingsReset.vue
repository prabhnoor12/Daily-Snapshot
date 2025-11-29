<template>
  <div class="settings-reset">
    <h3>Reset Settings</h3>
    <form @submit.prevent="submitReset">
      <div class="settings-form-row">
        <label class="settings-label">Keys (optional)</label>
        <input v-model="keysInput" class="settings-input" placeholder="e.g. theme,language" />
      </div>
      <div class="settings-form-row">
        <label class="settings-label">Notify user</label>
        <input type="checkbox" v-model="notifyUser" class="settings-checkbox-input" />
      </div>
      <button class="settings-btn" type="submit">Reset</button>
    </form>
    <div v-if="message" class="settings-message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { resetSettings } from '../../../api/settingApi';

const props = defineProps<{ userId: number }>();
const keysInput = ref('');
const notifyUser = ref(false);
const message = ref('');

async function submitReset() {
  message.value = '';
  let keys: string[] | undefined = undefined;
  if (keysInput.value.trim()) {
    keys = keysInput.value.split(',').map(k => k.trim()).filter(Boolean);
  }
  try {
    await resetSettings(props.userId, keys, notifyUser.value);
    message.value = 'Settings reset successfully.';
  } catch {
    message.value = 'Failed to reset settings.';
  }
}
</script>

<style src="./SettingsReset.css"></style>
