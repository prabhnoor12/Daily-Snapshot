<template>
  <div class="subscription-page">
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">List</button>
      <button class="tab" :class="{ active: activeTab === 'detail' }" @click="activeTab = 'detail'">Detail</button>
      <button class="tab" :class="{ active: activeTab === 'form' }" @click="activeTab = 'form'">Form</button>
    </div>
    <div class="tab-content">
      <SubscriptionList
        v-if="activeTab === 'list'"
        :subscriptions="subscriptions"
        @select="selectSubscription"
      />
      <SubscriptionDetail
        v-if="activeTab === 'detail'"
        :subscription="selectedSubscription"
      />
      <SubscriptionForm
        v-if="activeTab === 'form'"
        :initial="formInitial"
        :isEdit="isEdit"
        @submit="handleFormSubmit"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import SubscriptionList from '../components/SubscriptionList.vue';
import SubscriptionDetail from '../components/SubscriptionDetail.vue';
import SubscriptionForm from '../components/SubscriptionForm.vue';

// Dummy data for demonstration
const demoSubscriptions = [
  { id: 1, plan: 'standard', status: 'active', start_date: '2025-11-01', end_date: '2025-12-01', user_id: 101 },
  { id: 2, plan: 'premium', status: 'trial', start_date: '2025-11-15', end_date: '2025-12-15', user_id: 102 }
];

export default defineComponent({
  name: 'SubscriptionPage',
  components: {
    SubscriptionList,
    SubscriptionDetail,
    SubscriptionForm
  },
  setup() {
    const activeTab = ref<'list' | 'detail' | 'form'>('list');
    const subscriptions = ref(demoSubscriptions);
    const selectedSubscription = ref<any | null>(null);
    const formInitial = ref({ plan: 'standard', trial_days: 15, notify_user: true });
    const isEdit = ref(false);

    function selectSubscription(sub: any) {
      selectedSubscription.value = sub;
      activeTab.value = 'detail';
    }

    function handleFormSubmit(form: any) {
      // Handle form submission (add or update subscription)
      alert('Form submitted: ' + JSON.stringify(form));
      activeTab.value = 'list';
    }

    return {
      activeTab,
      subscriptions,
      selectedSubscription,
      formInitial,
      isEdit,
      selectSubscription,
      handleFormSubmit
    };
  }
});
</script>

<style src="./subscriptionPage.css"></style>
