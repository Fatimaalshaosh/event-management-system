import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { LanguageProvider } from "./i18n/language-context";
import { initPortraitProvider } from "./lib/identity";

// Off by default; activates the external portrait provider only when VITE_PORTRAITS is set.
initPortraitProvider();

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
);
