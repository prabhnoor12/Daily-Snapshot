<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <h2>Daily Snapshot</h2>
    </div>
    <ul class="sidebar-menu">
      <li>
        <button @click="navigateApp('/')">
          Home
        </button>
      </li>
      <li>
        <button @click="navigateApp('/analytics')">
          Analytics
        </button>
      </li>
      <li>
        <button @click="navigateApp('/settings')">
          Settings
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { Redirect } from '@shopify/app-bridge/actions';
import { inject } from 'vue';

const appBridge = inject('appBridge');

function navigateApp(path: string) {
  if (appBridge) {
    // @ts-ignore: appBridge type from inject is unknown
    const redirect = Redirect.create(appBridge as any);
    redirect.dispatch(Redirect.Action.APP, path);
  } else {
    window.location.href = path;
  }
}
</script>

<style src="./sidebar.css"></style>
