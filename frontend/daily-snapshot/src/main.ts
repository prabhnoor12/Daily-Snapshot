


import { createApp } from 'vue';
import App from './App.vue';
import { ShopifyAppBridgePlugin } from './shopifyAppBridge';
import { createRouter, createWebHistory } from 'vue-router';

import AuthPage from './features/auth/authPage.vue';
import Home from './features/Home.vue';
import Analytics from './features/analytics/page/analytics.vue';
import Settings from './features/settings/page/settingPage.vue';
import Subscription from './features/subscription/page/subscriptionPage.vue';
import BenchMark from './features/benchmark/page/benchmarkPage.vue';
import Forecast from './features/forecasting/page/forecastingPage.vue';
const routes = [
	{ path: '/', component: Home },
	{ path: '/auth', component: AuthPage },
	{ path: '/analytics', component: Analytics },
	{ path: '/benchmark', component: BenchMark },
	{ path: '/settings', component: Settings },
	{ path: '/subscription', component: Subscription },
	{path: '/forecasting', component: Forecast },
	{ path: '/:pathMatch(.*)*', redirect: '/' }, // catch-all
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});



// Removed unused getQueryParam helper

// Initialize Shopify App Bridge and provide it globally
const app = createApp(App);
app.use(router);
app.use(ShopifyAppBridgePlugin);
app.mount('#app');
console.log('[Vue] App mounted with Shopify App Bridge.');
