import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translateText } from './deeplTranslator';

// Example translations
const resources: Record<string, { translation: Record<string, string> }> = {
  en: {
    translation: {
      'Welcome': 'Welcome',
      // ...add more keys
    }
  },
  fr: {
    translation: {
      'Welcome': 'Bienvenue',
      // ...add more keys
    }
  }
};

// Utility to add a new key and translate it using DeepL
export async function addTranslationKey(key: string, text: string, targetLang: string) {
  const translated = await translateText(text, targetLang.toUpperCase());
  if (!resources[targetLang]) {
    resources[targetLang] = { translation: {} };
  }
  resources[targetLang].translation[key] = translated;
  i18n.addResource(targetLang, 'translation', key, translated);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
