

import { createApp } from 'vue';
import App from './App.vue';
// Removed Shopify App Bridge setup
import { createRouter, createWebHistory } from 'vue-router';

import AuthPage from './features/auth/authPage.vue';
import Home from './features/Home.vue';
import Analytics from './features/Analytics.vue';
import Settings from './features/Settings.vue';

const routes = [
	{ path: '/', component: Home },
	{ path: '/auth', component: AuthPage },
	{ path: '/analytics', component: Analytics },
	{ path: '/settings', component: Settings },
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
