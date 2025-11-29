<template>
  <div class="settings-page-container">
    <section class="settings-section">
      <SettingsList :userId="userId" />
    </section>
    <section class="settings-section"> 
      <SettingsBulkUpdate :userId="userId" />
    </section>
    <section class="settings-section">
      <SettingsReset :userId="userId" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SettingsList from '../components/SettingsList.vue';
import SettingsBulkUpdate from '../components/SettingsBulkUpdate.vue';
import SettingsReset from '../components/SettingsReset.vue';

// Replace with actual user ID logic as needed
const userId = ref(1);
</script>

<style src="./settingPage.css"></style>
