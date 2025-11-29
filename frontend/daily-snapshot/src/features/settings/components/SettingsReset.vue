<template>
  <div class="settings-reset">
    <h3>Reset Settings</h3>
    <form @submit.prevent="submitReset">
      <input v-model="keysInput" class="settings-input" placeholder="Comma-separated keys (optional)" />
      <label class="settings-checkbox">
        <input type="checkbox" v-model="notifyUser" /> Notify user
      </label>
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
