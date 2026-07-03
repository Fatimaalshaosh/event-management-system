import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { LanguageProvider } from "./i18n/language-context";
import { initPortraitProvider, initStaticDemoPortraits } from "./lib/identity";
import { setDemoFallback } from "@workspace/api-client-react";
import { demoFallback } from "./demo/demo-fallback";
import portraitMap from "./demo/portrait-map.json";
import portraitNameMap from "./demo/portrait-name-map.json";

// Off by default; activates the external portrait provider only when VITE_PORTRAITS is set.
initPortraitProvider();

// Static demo mode: on the backend-less Vercel deploy, serve snapshotted seed
// data when /api is unavailable, and resolve avatars to bundled portrait images.
// Production-only, so local dev always uses the real API + backend portraits.
if (import.meta.env.PROD) {
  setDemoFallback(demoFallback);
  initStaticDemoPortraits(portraitMap, portraitNameMap);

  // Demo UX: each new browser session should start at the login page, so the
  // access flow is always shown on Vercel. We clear any persisted auth once per
  // browser session (sessionStorage is per-tab and cleared when the tab closes),
  // so signing in still keeps the user logged in across refreshes within that
  // session, while a fresh visit / new tab returns to login.
  try {
    if (!sessionStorage.getItem("pp_demo_session")) {
      localStorage.removeItem("pp_auth");
      localStorage.removeItem("pp_remember");
      sessionStorage.setItem("pp_demo_session", "1");
    }
  } catch {
    /* storage unavailable — ignore */
  }
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
);
