<template>
  <div id="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Sidebar is globally registered in main.ts
</script>

<style src="./app.css"></style>
