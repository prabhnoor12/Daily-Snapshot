<template>
  <div>
    <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
      <Icon icon="mdi:menu" />
    </button>
    <nav class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2>Daily Snapshot</h2>
      </div>
      <ul class="sidebar-menu scrollable">
        <li>
          <button @click="navigateAndClose('/')">
            <span class="sidebar-icon"><Icon icon="mdi:home" /></span>
            Home
          </button>
        </li>
        <li>
          <button @click="navigateAndClose('/analytics')">
            <span class="sidebar-icon"><Icon icon="mdi:chart-bar" /></span>
            Analytics
          </button>
        </li>
        <li>
          <button @click="navigateAndClose('/settings')">
            <span class="sidebar-icon"><Icon icon="mdi:cog" /></span>
            Settings
          </button>
        </li>
        <li>
          <button @click="navigateAndClose('/subscription')">
            <span class="sidebar-icon"><Icon icon="mdi:credit-card-outline" /></span>
            Subscription
          </button>
        </li>
        <li>
          <button @click="navigateAndClose('/auth')">
            <span class="sidebar-icon"><Icon icon="simple-icons:shopify" /></span>
            Shopify Auth
          </button>
        </li>
      </ul>
    </nav>
    <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { Redirect } from '@shopify/app-bridge/actions';
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const appBridge = inject('appBridge');
const router = useRouter();
const sidebarOpen = ref(false);

function navigateApp(path: string) {
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

function navigateAndClose(path: string) {
  navigateApp(path);
  sidebarOpen.value = false;
}
</script>

<style src="./sidebar.css"></style>
