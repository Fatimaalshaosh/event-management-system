import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { LanguageProvider } from "./i18n/language-context";
import { initPortraitProvider } from "./lib/identity";
import { setDemoFallback } from "@workspace/api-client-react";
import { demoFallback } from "./demo/demo-fallback";

// Off by default; activates the external portrait provider only when VITE_PORTRAITS is set.
initPortraitProvider();

// Static demo mode: on the backend-less Vercel deploy, serve snapshotted seed
// data when /api is unavailable. Production-only, so local dev always uses the
// real API (and surfaces real errors).
if (import.meta.env.PROD) {
  setDemoFallback(demoFallback);
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
);
