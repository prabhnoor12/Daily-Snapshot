
<template>
  <form class="subscription-form" @submit.prevent="handleSubmit" novalidate>
    <h3>{{ isEdit ? 'Edit Subscription' : 'Start New Subscription' }}</h3>
    <label for="plan">Plan:
      <select id="plan" v-model="form.plan" required>
        <option value="standard">Standard</option>
        <option value="premium">Premium</option>
      </select>
    </label>
    <label for="trial_days">Trial Days:
      <input id="trial_days" type="number" v-model.number="form.trial_days" min="1" max="60" required />
    </label>
    <label for="notify_user">Notify User:
      <input id="notify_user" type="checkbox" v-model="form.notify_user" />
    </label>
    <button type="submit" :disabled="!isValid">{{ isEdit ? 'Update' : 'Start Trial' }}</button>
    <p v-if="error" class="form-error">{{ error }}</p>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import type { PropType } from 'vue';

export interface SubscriptionFormData {
  plan: string;
  trial_days: number;
  notify_user: boolean;
}

export default defineComponent({
  name: 'SubscriptionForm',
  props: {
    initial: {
      type: Object as PropType<SubscriptionFormData>,
      default: () => ({ plan: 'standard', trial_days: 15, notify_user: true }),
      validator: (val: SubscriptionFormData) => val && typeof val.plan === 'string' && typeof val.trial_days === 'number' && typeof val.notify_user === 'boolean'
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const form = ref({ ...props.initial });
    const error = ref('');
    watch(() => props.initial, (val) => { form.value = { ...val }; });

    const isValid = computed(() => {
      return (
        form.value.plan &&
        typeof form.value.trial_days === 'number' &&
        form.value.trial_days >= 1 &&
        form.value.trial_days <= 60
      );
    });

    function handleSubmit() {
      error.value = '';
      if (!isValid.value) {
        error.value = 'Please fill out all fields correctly.';
        return;
      }
      emit('submit', { ...form.value });
    }

    return { form, error, isValid, handleSubmit };
  }
});
</script>

<style src="./SubscriptionForm.css"></style>
