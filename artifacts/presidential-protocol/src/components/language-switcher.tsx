import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/language-context";

export function LanguageSwitcher({ variant = "topbar" }: { variant?: "topbar" | "login" }) {
  const { lang, setLang } = useLanguage();

  const isLogin = variant === "login";
  const baseBg = isLogin ? "rgba(255,255,255,0.65)" : "rgba(252,247,238,0.7)";

  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5 rounded-full border backdrop-blur-md"
      style={{
        background: baseBg,
        borderColor: "rgba(173,137,101,0.28)",
        boxShadow: "0 1px 2px rgba(75,64,56,0.04)",
      }}
      role="group"
      aria-label="Language switcher"
    >
      {(["ar", "en"] as const).map((code) => {
        const active = lang === code;
        const label = code === "ar" ? "العربية" : "English";
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className="relative px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full transition-colors"
            style={{
              color: active ? "#FCF7EE" : "#95837A",
              fontFamily: code === "ar" ? "'Noto Sans Arabic', sans-serif" : "'Playfair Display', Georgia, serif",
              letterSpacing: code === "ar" ? 0 : "0.04em",
              minWidth: 64,
              cursor: active ? "default" : "pointer",
              zIndex: 1,
            }}
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId={`lang-pill-${variant}`}
                className="absolute inset-0 rounded-full"
                style={{ background: "#AD8965", zIndex: -1 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
