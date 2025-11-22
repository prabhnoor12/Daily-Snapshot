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
      <li>
        <button @click="navigateApp('/auth')">
          Shopify Auth
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { Redirect } from '@shopify/app-bridge/actions';
import { inject } from 'vue';
import { useRouter } from 'vue-router';

const appBridge = inject('appBridge');
const router = useRouter();

function navigateApp(path: string) {
  // Prefer client-side navigation when App Bridge is unavailable (local dev)
  if (!appBridge) {
    router.push(path);
    return;
  }
  try {
    const redirect = Redirect.create(appBridge as any);
    redirect.dispatch(Redirect.Action.APP, path);
  } catch (e) {
    console.error('[Sidebar] App Bridge redirect failed, falling back to router.', e);
    router.push(path);
  }
}
</script>

<style src="./sidebar.css"></style>
