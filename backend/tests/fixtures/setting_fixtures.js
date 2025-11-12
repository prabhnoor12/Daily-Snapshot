// Fixtures for settings controller tests

export const settingString = { key: 'app.name', value: 'Daily Snapshot', type: 'string' };
export const settingNumber = { key: 'refresh.interval', value: 15, type: 'number' };
export const settingBoolean = { key: 'feature.enabled', value: true, type: 'boolean' };
export const settingJson = { key: 'ui.theme', value: { mode: 'dark', contrast: 'high' }, type: 'json' };

export const invalidSettingBadKey = { key: 'invalid key with spaces', value: 'oops', type: 'string' };
export const invalidSettingMissingValue = { key: 'missing.value' };

export const bulkMixed = [
  settingString,
  settingNumber,
  invalidSettingBadKey, // should produce validation error
  settingJson
];

export default {
  settingString,
  settingNumber,
  settingBoolean,
  settingJson,
  invalidSettingBadKey,
  invalidSettingMissingValue,
  bulkMixed
};
