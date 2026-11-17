// Self-hosted variable fonts (no Google Fonts request, no third-party FOUT).
// Inter: upright variable weights. Fraunces: italic only — the site uses it
// exclusively for the `em` accent, so upright Fraunces is never shipped.
// Both CSS files are unicode-range split, so the browser only downloads the
// latin woff2 subset it actually renders.
import "./styles/fonts.css";
import "./styles/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";

const container = document.getElementById("root");

if (!container) {
  throw new Error('Root container "#root" is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
