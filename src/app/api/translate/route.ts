import { NextRequest, NextResponse } from "next/server";
import { translate } from "@vitalets/google-translate-api";

// Rate limiting: track requests per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 500; // requests per minute (increased for batch operations)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Extract plain text from HTML, removing all tags and style/script content
 */
function extractTextFromHtml(html: string): { texts: string[]; template: string } {
  // Remove style and script tags completely
  let cleaned = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  
  // Extract text content from remaining HTML
  const texts: string[] = [];
  let template = cleaned;
  let index = 0;
  
  // Replace text content with placeholders
  template = cleaned.replace(/>([^<]+)</g, (match, text) => {
    const trimmed = text.trim();
    if (trimmed && trimmed.length > 1 && !/^[\s\n\r\t]+$/.test(trimmed)) {
      texts.push(trimmed);
      return `>{{__T${index++}__}}<`;
    }
    return match;
  });
  
  return { texts, template };
}

/**
 * Reconstruct HTML with translated texts
 */
function reconstructHtml(template: string, translatedTexts: string[]): string {
  let result = template;
  translatedTexts.forEach((text, index) => {
    result = result.replace(`{{__T${index}__}}`, text);
  });
  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "anonymous";
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { text, texts, html, targetLang, sourceLang = "auto" } = body;

    // Validate target language
    if (!targetLang) {
      return NextResponse.json(
        { error: "Target language is required" },
        { status: 400 }
      );
    }

    // Handle single text translation
    if (text) {
      const result = await translate(text, { 
        from: sourceLang === "auto" ? undefined : sourceLang, 
        to: targetLang 
      });
      
      return NextResponse.json({
        translatedText: result.text,
        detectedLanguage: result.raw?.src || sourceLang,
      });
    }

    // Handle batch text translation - combine into single request for speed
    if (texts && Array.isArray(texts)) {
      // Filter and prepare texts
      const SEPARATOR = "\n§§§\n"; // Unique separator that won't appear in normal text
      const processedTexts: { index: number; text: string; skip: boolean }[] = texts.map((t: string, i: number) => {
        const trimmed = (t || '').trim();
        // Skip empty, too short, or code-like content
        const shouldSkip = !trimmed || 
          trimmed.length < 3 ||
          (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':'));
        return { index: i, text: trimmed, skip: shouldSkip };
      });
      
      const toTranslate = processedTexts.filter(p => !p.skip);
      
      if (toTranslate.length === 0) {
        return NextResponse.json({ translatedTexts: texts });
      }
      
      try {
        // Combine all texts with separator for single API call
        const combinedText = toTranslate.map(p => p.text).join(SEPARATOR);
        
        const result = await translate(combinedText, { 
          from: sourceLang === "auto" ? undefined : sourceLang, 
          to: targetLang 
        });
        
        // Split back by separator
        const translatedParts = result.text.split(/\n?§§§\n?/);
        
        // Map results back
        const results = new Map<number, string>();
        toTranslate.forEach((item, idx) => {
          results.set(item.index, translatedParts[idx] || item.text);
        });
        
        // Build final results array
        const finalResults = texts.map((t: string, i: number) => {
          if (results.has(i)) {
            return results.get(i)!;
          }
          return t;
        });
        
        return NextResponse.json({
          translatedTexts: finalResults,
        });
      } catch (err) {
        // Fallback: if combined fails, return originals
        console.error("Batch translation failed:", err);
        return NextResponse.json({ translatedTexts: texts });
      }
    }

    // Handle HTML translation - extract text, translate, reconstruct
    if (html) {
      const { texts: extractedTexts, template } = extractTextFromHtml(html);
      
      if (extractedTexts.length === 0) {
        return NextResponse.json({ translatedHTML: html });
      }
      
      // Translate extracted texts in batches
      const batchSize = 10;
      const translatedTexts: string[] = [];
      
      for (let i = 0; i < extractedTexts.length; i += batchSize) {
        const batch = extractedTexts.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (t: string) => {
            try {
              // Skip CSS-like content
              if (t.includes('{') && t.includes(':') && t.includes(';')) {
                return t;
              }
              const result = await translate(t, { 
                from: sourceLang === "auto" ? undefined : sourceLang, 
                to: targetLang 
              });
              return result.text;
            } catch {
              return t;
            }
          })
        );
        translatedTexts.push(...batchResults);
      }
      
      const translatedHTML = reconstructHtml(template, translatedTexts);
      
      return NextResponse.json({
        translatedHTML,
        detectedLanguage: sourceLang,
      });
    }

    return NextResponse.json(
      { error: "No text, texts, or html provided" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}

// Also support GET for simple translations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const targetLang = searchParams.get("to");
  const sourceLang = searchParams.get("from") || "auto";

  if (!text || !targetLang) {
    return NextResponse.json(
      { error: "text and to parameters are required" },
      { status: 400 }
    );
  }

  try {
    const result = await translate(text, { 
      from: sourceLang === "auto" ? undefined : sourceLang, 
      to: targetLang 
    });
    
    return NextResponse.json({
      translatedText: result.text,
      detectedLanguage: result.raw?.src || sourceLang,
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
