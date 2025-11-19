

import { createApp } from 'vue';
import App from './App.vue';

import ErrorHandling from './components/error_handling.vue';
import Sidebar from './components/sidebar.vue';
import createAppBridge from '@shopify/app-bridge';
import { createRouter, createWebHistory } from 'vue-router';

// Example routes, add your pages/components here
const routes = [
	{ path: '/', component: App }, // Main page
	// { path: '/about', component: About },
	// { path: '/dashboard', component: Dashboard },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});



// Shopify App Bridge initialization
// 'host' should be the base64-encoded shop domain from Shopify (e.g., from query params)
const appBridge = createAppBridge({
	apiKey: 'YOUR_SHOPIFY_API_KEY', // Replace with your actual API key or use environment variable
	host: 'YOUR_BASE64_HOST', // Replace with your actual base64-encoded host from Shopify
	forceRedirect: true,
});

const app = createApp(App);
app.component('ErrorHandling', ErrorHandling);
app.component('Sidebar', Sidebar);
app.use(router);
app.provide('appBridge', appBridge);
app.mount('#app');
