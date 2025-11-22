<template>
  <div class="auth-container">
    <div class="auth-card">
      <img src="https://cdn.shopify.com/shopifycloud/web/assets/v1/shopify-logo.svg" alt="Shopify Logo" class="shopify-logo" />
      <h1>Connect Your Shopify Store</h1>
      <p>Sign in with your Shopify store to get started with Daily Snapshot analytics.</p>
      <input v-model="shopDomain" type="text" placeholder="yourshop.myshopify.com" class="shop-input" />
      <button @click="startOAuth" class="auth-btn">Connect Store</button>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
