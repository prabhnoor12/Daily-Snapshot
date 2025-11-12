// Subscription fixtures

export const shopRecord = {
  shop: 'example-shop.myshopify.com',
  accessToken: 'shpca_test_token'
};

export const validCreatePayload = {
  planName: 'Pro',
  price: 20.0,
  trialDays: 14,
  returnUrl: 'https://app.example.com/confirm'
};

export const secondCreatePayload = {
  planName: 'Enterprise Plan',
  price: 99.0,
  trialDays: 14,
  returnUrl: 'https://app.example.com/confirm'
};

export const invalidPayloadMissingFields = {
  planName: '',
  price: -5,
  returnUrl: 'not-a-url'
};

export const subscriptionDbRecord = {
  id: 1,
  shop: shopRecord.shop,
  chargeId: 12345,
  planName: validCreatePayload.planName,
  price: validCreatePayload.price,
  status: 'pending',
  confirmationUrl: 'https://billing-confirm.example.com/12345',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const cancelledSubscriptionRecord = {
  ...subscriptionDbRecord,
  status: 'cancelled',
  cancelledAt: new Date()
};

export default {
  shopRecord,
  validCreatePayload,
  secondCreatePayload,
  invalidPayloadMissingFields,
  subscriptionDbRecord,
  cancelledSubscriptionRecord
};
