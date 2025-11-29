<template>
  <div class="auth-container">
    <div class="auth-card">
      <span class="shopify-icon">
        <Icon icon="simple-icons:shopify" />
      </span>
      <h1 class="auth-title">Connect Your Shopify Store</h1>
      <p class="auth-desc">Sign in with your Shopify store to get started with Daily Snapshot analytics.</p>
      <div class="input-area">
        <input v-model="shopDomain" type="text" placeholder="yourshop.myshopify.com" class="shop-input" />
        <button @click="startOAuth" class="auth-btn">Connect Store</button>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { initiateShopifyOAuth } from '../../api/authApi';

const shopDomain = ref('');
const error = ref('');

async function startOAuth() {
  error.value = '';
  if (!shopDomain.value || !shopDomain.value.endsWith('.myshopify.com')) {
    error.value = 'Please enter a valid Shopify domain.';
    return;
  }
  try {
    const redirectUrl = await initiateShopifyOAuth(shopDomain.value);
    window.location.href = redirectUrl;
  } catch (e) {
    error.value = 'Failed to initiate Shopify OAuth. Please try again.';
  }
}
</script>

<style src="./authPage.css"></style>
