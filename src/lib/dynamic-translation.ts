import type { ContentTranslations } from "@/lib/parse";

const CHUNK_SIZE = 1200;
const pending = new Map<string, Promise<string>>();
const cache = new Map<string, string>();

async function translatePlain(text: string, locale: string): Promise<string> {
  const source = text.trim();
  if (!source) return text;
  const key = `${locale}:${source}`;
  const cached = cache.get(key);
  if (cached) return text.replace(source, cached);
  const active = pending.get(key);
  if (active) return text.replace(source, await active);

  const task = (async () => {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "en");
    url.searchParams.set("tl", locale);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", source);
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Translation request failed (${response.status})`);
    const data = await response.json() as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error("Translation service returned an unexpected response");
    const translated = (data[0] as unknown[])
      .map((item) => Array.isArray(item) && typeof item[0] === "string" ? item[0] : "")
      .join("");
    if (!translated.trim()) throw new Error("Translation service returned empty text");
    cache.set(key, translated);
    return translated;
  })();
  pending.set(key, task);
  try { return text.replace(source, await task); } finally { pending.delete(key); }
}

async function translateText(text: string, locale: string): Promise<string> {
  if (text.length <= CHUNK_SIZE) return translatePlain(text, locale);
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > CHUNK_SIZE) {
    const boundary = remaining.lastIndexOf(" ", CHUNK_SIZE);
    const cut = boundary > CHUNK_SIZE * 0.4 ? boundary : CHUNK_SIZE;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  chunks.push(remaining);
  return (await Promise.all(chunks.map((chunk) => translatePlain(chunk, locale)))).join("");
}

async function translateHtml(value: string, locale: string): Promise<string> {
  if (!/<\/?[a-z][\s\S]*>/i.test(value)) return translateText(value, locale);
  const tokens = value.split(/(<[^>]+>)/g);
  const translated = await Promise.all(tokens.map((token) => token.startsWith("<") || !token.trim() ? token : translateText(token, locale)));
  return translated.join("");
}

/**
 * Uses the same stored-translation pattern as the source platform: use the
 * locale block when present, translate only missing fields, then save that
 * locale block back to Parse for subsequent fast reads.
 */
export async function ensureDynamicTranslation(params: {
  className: string;
  objectId: string;
  locale: string;
  fields: Record<string, string>;
  translations?: ContentTranslations;
  persist: (translations: ContentTranslations) => Promise<void>;
}): Promise<ContentTranslations | undefined> {
  const { className, objectId, locale, fields, translations, persist } = params;
  if (locale === "en" || !locale) return translations;
  const existing = translations?.[locale] ?? {};
  const missing = Object.fromEntries(Object.entries(fields).filter(([key, value]) => {
    const saved = existing[key];
    return value.trim() && (typeof saved !== "string" || !saved.trim() || (saved.trim() === value.trim() && value.length > 12));
  }));
  if (!Object.keys(missing).length) return translations;

  try {
    const translated = Object.fromEntries(await Promise.all(Object.entries(missing).map(async ([key, value]) => [key, await translateHtml(value, locale)])));
    const merged: ContentTranslations = { ...(translations ?? {}), [locale]: { ...existing, ...translated } };
    await persist(merged);
    return merged;
  } catch (error) {
    console.warn(`[translation] Could not translate ${className}/${objectId}:`, error);
    return translations;
  }
}
