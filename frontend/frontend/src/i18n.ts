import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Example translations
const resources = {
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
