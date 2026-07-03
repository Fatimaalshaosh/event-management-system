import { createContext, useCallback, useContext, useEffect, useState } from "react";
import i18n, { LANG_STORAGE_KEY, type Lang } from "./index";

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (i18n.language as Lang) ?? "ar");

  const applyLang = useCallback((next: Lang) => {
    void i18n.changeLanguage(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem(LANG_STORAGE_KEY, next); } catch { /* noop */ }
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir: lang === "ar" ? "rtl" : "ltr",
        setLang: applyLang,
        toggleLang: () => applyLang(lang === "ar" ? "en" : "ar"),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
