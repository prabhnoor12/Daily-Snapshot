// deeplTranslator.ts
// Utility for translating text using DeepL API

const DEEPL_API_KEY = 'd88405c1-48a8-499f-abda-3ff6d76d0761:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

export async function translateText(text: string, targetLang: string = 'EN'): Promise<string> {
  const params = new URLSearchParams();
  params.append('auth_key', DEEPL_API_KEY);
  params.append('text', text);
  params.append('target_lang', targetLang);

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!response.ok) {
      throw new Error('Translation failed: ' + response.statusText);
    }
    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error('DeepL translation error:', error);
    return '';
  }
}
