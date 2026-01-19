/**
 * Translation Service
 * Provides real-time content translation using free Google Translate API
 */

// Supported languages for content translation
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "zh", name: "Chinese", nativeName: "简体中文" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

// Cache key prefix for translations
const TRANSLATION_CACHE_PREFIX = "inbo_translation_";

// Cache expiration time (24 hours)
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

interface CachedTranslation {
  text: string;
  timestamp: number;
}

/**
 * Get cached translation from localStorage
 */
function getCachedTranslation(text: string, targetLang: string): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cacheKey = `${TRANSLATION_CACHE_PREFIX}${targetLang}_${hashText(text)}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const parsed: CachedTranslation = JSON.parse(cached);
      // Check if cache is still valid
      if (Date.now() - parsed.timestamp < CACHE_EXPIRATION_MS) {
        return parsed.text;
      }
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }
  } catch (e) {
    console.warn("Translation cache read error:", e);
  }
  
  return null;
}

/**
 * Save translation to localStorage cache
 */
function setCachedTranslation(text: string, targetLang: string, translatedText: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const cacheKey = `${TRANSLATION_CACHE_PREFIX}${targetLang}_${hashText(text)}`;
    const cacheData: CachedTranslation = {
      text: translatedText,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (e) {
    console.warn("Translation cache write error:", e);
  }
}

/**
 * Simple hash function for cache keys
 */
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Clean text before translation - remove HTML artifacts
 */
function cleanTextForTranslation(text: string): string {
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, ' ');
  // Remove CSS-like content
  cleaned = cleaned.replace(/\{[^}]*\}/g, ' ');
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

/**
 * Check if text should be skipped (code, CSS, etc.)
 */
function shouldSkipTranslation(text: string): boolean {
  const trimmed = text.trim();
  // Skip empty or very short text
  if (trimmed.length < 3) return true;
  // Skip if it looks like CSS/code
  if (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':')) return true;
  // Skip if it's mostly numbers/symbols
  const letterCount = (trimmed.match(/[a-zA-Z\u0080-\uFFFF]/g) || []).length;
  if (letterCount < trimmed.length * 0.3) return true;
  return false;
}

/**
 * Translate a single text string
 */
export async function translateText(
  text: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode = "en"
): Promise<string> {
  // Return original if same language or empty
  if (!text.trim() || targetLang === sourceLang) {
    return text;
  }

  // Clean the text
  const cleanedText = cleanTextForTranslation(text);
  
  // Skip if text should not be translated
  if (shouldSkipTranslation(cleanedText)) {
    return text;
  }

  // Check cache first
  const cached = getCachedTranslation(cleanedText, targetLang);
  if (cached) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: cleanedText,
        targetLang,
        sourceLang,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText || cleanedText;

    // Cache the result
    setCachedTranslation(cleanedText, targetLang, translatedText);

    return translatedText;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.warn("Translation timed out");
    } else {
      console.error("Translation error:", error);
    }
    return text; // Return original on error
  }
}

/**
 * Translate multiple text strings in batch
 */
export async function translateBatch(
  texts: string[],
  targetLang: LanguageCode,
  sourceLang: LanguageCode = "en"
): Promise<string[]> {
  // Return original if same language
  if (targetLang === sourceLang) {
    return texts;
  }

  // Clean texts and check cache
  const results: string[] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  texts.forEach((text, index) => {
    const cleaned = cleanTextForTranslation(text);
    
    // Skip texts that shouldn't be translated
    if (shouldSkipTranslation(cleaned)) {
      results[index] = text;
      return;
    }
    
    const cached = getCachedTranslation(cleaned, targetLang);
    if (cached) {
      results[index] = cached;
    } else {
      uncachedIndices.push(index);
      uncachedTexts.push(cleaned);
    }
  });

  // If all texts are cached or skipped, return immediately
  if (uncachedTexts.length === 0) {
    return results;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for batch
    
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts: uncachedTexts,
        targetLang,
        sourceLang,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Batch translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedTexts: string[] = data.translatedTexts || uncachedTexts;

    // Fill in the results and cache
    uncachedIndices.forEach((originalIndex, batchIndex) => {
      const translated = translatedTexts[batchIndex] || uncachedTexts[batchIndex];
      results[originalIndex] = translated;
      setCachedTranslation(uncachedTexts[batchIndex], targetLang, translated);
    });

    return results;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.warn("Batch translation timed out");
    } else {
      console.error("Batch translation error:", error);
    }
    // Return original texts for uncached items on error
    // Return original texts for uncached items on error
    uncachedIndices.forEach((originalIndex, batchIndex) => {
      results[originalIndex] = uncachedTexts[batchIndex];
    });
    return results;
  }
}

/**
 * Translate HTML content while preserving structure
 */
export async function translateHTML(
  html: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode = "en"
): Promise<string> {
  if (!html.trim() || targetLang === sourceLang) {
    return html;
  }

  // Check cache first
  const cached = getCachedTranslation(html, targetLang);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html,
        targetLang,
        sourceLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTML translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedHTML = data.translatedHTML || html;

    // Cache the result
    setCachedTranslation(html, targetLang, translatedHTML);

    return translatedHTML;
  } catch (error) {
    console.error("HTML translation error:", error);
    return html;
  }
}

/**
 * Clear translation cache (useful for debugging or when switching accounts)
 */
export function clearTranslationCache(): void {
  if (typeof window === "undefined") return;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(TRANSLATION_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn("Failed to clear translation cache:", e);
  }
}

export default {
  translateText,
  translateBatch,
  translateHTML,
  clearTranslationCache,
  SUPPORTED_LANGUAGES,
};
