

import { createApp } from 'vue';
import App from './App.vue';
// Removed Shopify App Bridge setup
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

// Create Vue app first so we can mount even if App Bridge fails
const app = createApp(App);
app.use(router);

// App Bridge setup removed
app.mount('#app');
console.log('[Vue] App mounted.');
