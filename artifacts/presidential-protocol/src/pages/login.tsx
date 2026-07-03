import { palette } from "@/theme";
import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Star, Lock, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { signIn } from "@/lib/storage";

const C = { ...palette, border: "#E8DED1" };

export default function LoginPage() {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === "Fatima" && password === "1234") {
        signIn(remember);
        navigate("/");
      } else {
        setError(t("login.invalid"));
        setLoading(false);
      }
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputFontFamily =
    lang === "ar" ? "'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif";

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    paddingBlock: 12,
    paddingInlineStart: 42,
    paddingInlineEnd: 16,
    borderRadius: 12,
    border: `1.5px solid ${hasError ? C.error : C.border}`,
    background: C.card,
    color: C.text,
    fontSize: 13,
    outline: "none",
    textAlign: dir === "rtl" ? "right" : "left",
    fontFamily: inputFontFamily,
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  // Place form panel always on the leading side; palace on the trailing side.
  // In RTL: form on right, palace on left. In LTR: form on left, palace on right.
  const formOrder = dir === "rtl" ? 2 : 1;
  const palaceOrder = dir === "rtl" ? 1 : 2;

  return (
    <div
      dir="ltr"
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: inputFontFamily,
        background: C.bg,
      }}
    >
      {/* ── Form panel ─────────────────────────────── */}
      <div
        style={{
          order: formOrder,
          flex: "0 0 44%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 52px",
          position: "relative",
          background: C.bg,
          overflow: "hidden",
        }}
      >
        {/* Geometric background pattern */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.055, pointerEvents: "none" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#AD8965" strokeWidth="0.8" />
              <path d="M40 12 L68 40 L40 68 L12 40 Z" fill="none" stroke="#AD8965" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="7" fill="none" stroke="#AD8965" strokeWidth="0.5" />
              <line x1="40" y1="0" x2="40" y2="12" stroke="#AD8965" strokeWidth="0.5" />
              <line x1="80" y1="40" x2="68" y2="40" stroke="#AD8965" strokeWidth="0.5" />
              <line x1="40" y1="80" x2="40" y2="68" stroke="#AD8965" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="12" y2="40" stroke="#AD8965" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo)" />
        </svg>

        {/* Language switcher — top of form panel */}
        <div
          style={{
            position: "absolute",
            top: 24,
            insetInlineEnd: 24,
            zIndex: 2,
          }}
        >
          <LanguageSwitcher variant="login" />
        </div>

        {/* Form content */}
        <div dir={dir} style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400 }}>
          {/* Emblem */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: dir === "rtl" ? "flex-end" : "flex-start", marginBottom: 36 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: `linear-gradient(145deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 28px rgba(173,137,101,0.32), 0 2px 8px rgba(173,137,101,0.2)",
                marginBottom: 18,
              }}
            >
              <Star size={28} strokeWidth={0.8} fill="white" style={{ color: "white" }} />
            </div>

            <h1
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: C.text,
                textAlign: dir === "rtl" ? "right" : "left",
                lineHeight: 1.6,
                marginBottom: 6,
                fontFamily: lang === "en" ? "'Playfair Display', Georgia, serif" : "inherit",
              }}
            >
              {t("login.authority")}
            </h1>
            <p
              style={{
                fontSize: 10,
                color: C.secondary,
                textAlign: dir === "rtl" ? "right" : "left",
                letterSpacing: "0.01em",
                lineHeight: 1.5,
                fontFamily: lang === "en" ? "'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif",
              }}
            >
              {t("login.authorityEn")}
            </p>
          </div>

          {/* Thin divider */}
          <div
            style={{
              height: 1,
              background: `linear-gradient(${dir === "rtl" ? "to left" : "to right"}, ${C.border}, transparent)`,
              marginBottom: 28,
            }}
          />

          {/* Welcome heading */}
          <div style={{ marginBottom: 24, textAlign: dir === "rtl" ? "right" : "left" }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: C.text,
                fontFamily: lang === "en" ? "'Playfair Display', Georgia, serif" : "Georgia, serif",
                marginBottom: 6,
              }}
            >
              {t("login.welcome")}
            </h2>
            <p style={{ fontSize: 13, color: C.secondary }}>
              {t("login.instruction")}
            </p>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Username */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.secondary,
                  marginBottom: 7,
                  textAlign: dir === "rtl" ? "right" : "left",
                }}
              >
                {t("login.username")}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("login.usernamePh")}
                  style={inputStyle(!!error)}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.gold;
                    e.target.style.boxShadow = `0 0 0 3px rgba(173,137,101,0.12)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? C.error : C.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <User
                  size={15}
                  strokeWidth={1.5}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    insetInlineStart: 14,
                    color: C.secondary,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.secondary,
                  marginBottom: 7,
                  textAlign: dir === "rtl" ? "right" : "left",
                }}
              >
                {t("login.password")}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("login.passwordPh")}
                  style={{ ...inputStyle(!!error), paddingInlineEnd: 42 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.gold;
                    e.target.style.boxShadow = `0 0 0 3px rgba(173,137,101,0.12)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? C.error : C.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <Lock
                  size={15}
                  strokeWidth={1.5}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    insetInlineStart: 14,
                    color: C.secondary,
                    pointerEvents: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    insetInlineEnd: 12,
                    background: "none",
                    border: "none",
                    padding: 4,
                    cursor: "pointer",
                    color: C.secondary,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPw ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: dir === "rtl" ? "row" : "row-reverse",
              }}
            >
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  color: C.gold,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t("login.forgot")}
              </button>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  color: C.secondary,
                  userSelect: "none",
                }}
              >
                <span>{t("login.remember")}</span>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: C.gold, width: 14, height: 14 }}
                />
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(200,75,56,0.07)",
                  border: "1px solid rgba(200,75,56,0.18)",
                  textAlign: dir === "rtl" ? "right" : "left",
                }}
              >
                <p style={{ fontSize: 12, color: C.error, margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading
                  ? C.goldLight
                  : `linear-gradient(135deg, #C4A07D 0%, ${C.gold} 100%)`,
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: inputFontFamily,
                boxShadow: loading ? "none" : "0 4px 18px rgba(173,137,101,0.38)",
                marginTop: 4,
                transition: "opacity 0.2s, box-shadow 0.2s",
                opacity: loading ? 0.75 : 1,
                letterSpacing: lang === "en" ? "0.03em" : 0,
              }}
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </button>
          </div>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              fontSize: 10,
              color: C.secondary,
              marginTop: 32,
              opacity: 0.65,
            }}
          >
            {t("login.footer")}
          </p>
        </div>
      </div>

      {/* ── Palace image ───────────────────────────── */}
      <div
        style={{
          order: palaceOrder,
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src="/palace-hero-2.jpg"
          alt={t("login.palaceCaption")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />
        {/* Warm edge blend — toward the form panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              dir === "rtl"
                ? `linear-gradient(to right, ${C.bg} 0%, transparent 18%)`
                : `linear-gradient(to left, ${C.bg} 0%, transparent 18%)`,
          }}
        />
        {/* Cinematic dark vignette bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "38%",
            background: "linear-gradient(to top, rgba(51,40,31,0.72) 0%, transparent 100%)",
          }}
        />
        {/* Location label */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            insetInlineStart: 36,
          }}
        >
          <p
            dir={dir}
            style={{
              color: "rgba(252,247,238,0.92)",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 4,
              fontFamily: lang === "en" ? "'Playfair Display', Georgia, serif" : "'Noto Sans Arabic', sans-serif",
            }}
          >
            {t("login.palaceCaption")}
          </p>
          <p style={{ color: "rgba(252,247,238,0.55)", fontSize: 11, letterSpacing: "0.04em" }}>
            {t("login.palaceCaptionEn")}
          </p>
        </div>

        {/* Decorative thin border frame inset */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(252,247,238,0.12)",
            borderRadius: 4,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
