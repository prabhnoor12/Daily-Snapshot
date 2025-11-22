
<template>
  <div id="app-container">
    <Sidebar />
    <ErrorHandling :error="error" :errorMessage="errorMessage" @clear-error="clearError" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/sidebar.vue';
import ErrorHandling from './components/error_handling.vue';
import { ref } from 'vue';

const error = ref(false);
const errorMessage = ref('');

function clearError() {
  error.value = false;
  errorMessage.value = '';
}
</script>

<style src="./app.css"></style>
