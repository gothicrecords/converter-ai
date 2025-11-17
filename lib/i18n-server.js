import fs from 'fs';
import path from 'path';

// Helper per caricare traduzioni server-side
export async function loadTranslationsSSR(locale = 'en') {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'common.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error loading translations SSR:', error);
    // Fallback to English
    if (locale !== 'en') {
      return loadTranslationsSSR('en');
    }
    return {};
  }
}
