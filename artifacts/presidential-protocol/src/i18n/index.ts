import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ar } from "./locales/ar";
import { en } from "./locales/en";

export const LANG_STORAGE_KEY = "pp_lang";
export type Lang = "ar" | "en";

const stored = (typeof window !== "undefined"
  ? (localStorage.getItem(LANG_STORAGE_KEY) as Lang | null)
  : null);

const initialLang: Lang = stored === "en" ? "en" : "ar";

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: "ar",
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (typeof document !== "undefined") {
  document.documentElement.lang = initialLang;
  document.documentElement.dir = initialLang === "ar" ? "rtl" : "ltr";
}

export default i18n;
