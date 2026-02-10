import { useMemo } from "react";
import { translations } from "./translations";

function getBrowserLang() {
  const lang = navigator.language || navigator.languages?.[0] || "en";
  return lang.startsWith("it") ? "it" : "en";
}

export function useTranslation() {
  const lang = useMemo(() => getBrowserLang(), []);

  const t = (key, fallback) => {
    const keys = key.split(".");
    let result = translations[lang];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) break;
    }
    return result ?? fallback ?? key;
  };

  return { t, lang };
}
