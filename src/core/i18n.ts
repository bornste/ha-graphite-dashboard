// Translations: all user facing texts live in src/translations/<language>.json.
// Language: the theme variable --graphite-language (e.g. "de") if set, otherwise the
// Home Assistant user language; missing languages and keys fall back to English.
import type { HomeAssistant } from "./types";
import de from "../translations/de.json";
import en from "../translations/en.json";

type TranslationTree = { [key: string]: string | TranslationTree };

const translations: Record<string, TranslationTree> = { de, en };
const fallbackLanguage = "en";

// "de-CH" -> "de" when only the base language is translated
function supportedLanguage(language: string | undefined): string {
  const code = (language || "").trim().toLowerCase();
  if (translations[code]) return code;
  const base = code.split("-")[0];
  return translations[base] ? base : fallbackLanguage;
}

// language for an element: theme variable first (it follows the view theme), then Home Assistant
export function languageOf(element: Element | undefined, hass: HomeAssistant | undefined): string {
  const themeLanguage = element ? getComputedStyle(element).getPropertyValue("--graphite-language") : "";
  return supportedLanguage(themeLanguage.replaceAll('"', "") || hass?.locale?.language || hass?.language);
}

function lookup(tree: TranslationTree | undefined, key: string): string | undefined {
  let node: string | TranslationTree | undefined = tree;
  for (const part of key.split(".")) {
    if (!node || typeof node === "string") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

// text for a key like "time.sinceMinutes"; {name} placeholders are replaced by the params
export function translate(language: string, key: string, params: Record<string, string | number> = {}): string {
  const text = lookup(translations[language], key) ?? lookup(translations[fallbackLanguage], key) ?? key;
  return Object.entries(params).reduce((result, [name, value]) => result.split(`{${name}}`).join(String(value)), text);
}
