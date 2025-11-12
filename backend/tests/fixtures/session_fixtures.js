// Session fixtures for testing session controller

export const rawSessionContent = (data) => JSON.stringify(data);

export const validSession = {
  id: 'sess_valid_1',
  content: rawSessionContent({ userId: 1, expires: new Date(Date.now() + 60_000).toISOString() }),
  shop: 'valid-shop.example.com'
};

export const expiredSession = {
  id: 'sess_expired_1',
  content: rawSessionContent({ userId: 1, expires: new Date(Date.now() - 60_000).toISOString() }),
  shop: 'expired-shop.example.com'
};

export const invalidContentSession = {
  id: 'sess_invalid_content_1',
  content: '{"userId":1,"expires":"not-a-date"', // malformed JSON
  shop: 'invalid-json-shop.example.com'
};

export const newSessionPayload = {
  id: 'sess_new_1',
  content: rawSessionContent({ userId: 2, expires: new Date(Date.now() + 120_000).toISOString() }),
  shop: 'new-shop.example.com'
};

export const updateSessionPayload = {
  id: validSession.id,
  content: rawSessionContent({ userId: 1, expires: new Date(Date.now() + 300_000).toISOString() }),
  shop: 'valid-shop.example.com'
};

export const missingFieldsPayload = { id: 'sess_missing_fields' }; // lacks content & shop

export default {
  validSession,
  expiredSession,
  invalidContentSession,
  newSessionPayload,
  updateSessionPayload,
  missingFieldsPayload,
  rawSessionContent
};
