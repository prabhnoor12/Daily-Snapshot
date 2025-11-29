import { ref } from 'vue';

// This composable manages the current shopId for analytics components.
// In a real app, this could be replaced with a Pinia store, Vuex, or context from authentication/session.
const shopId = ref<number | null>(null);

export function useShopId() {
  return { shopId };
}
