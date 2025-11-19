import fs from 'fs';
import path from 'path';

function stripBOM(content) {
  if (!content) return content;
  // Remove UTF-8 BOM if present
  return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content.replace(/^\uFEFF/, '');
}

// Helper per caricare traduzioni server-side
export async function loadTranslationsSSR(locale = 'en') {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'common.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const clean = stripBOM(fileContents);
    return JSON.parse(clean);
  } catch (error) {
    console.error('Error loading translations SSR:', error);
    // Fallback to English
    if (locale !== 'en') {
      return loadTranslationsSSR('en');
    }
    return {};
  }
}
