import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Renderer root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.DEV) {
  void import("./accessibility")
    .then(({ runAxeScan }) => {
      window.runAxeScan = runAxeScan;
      return runAxeScan();
    })
    .catch((error: unknown) => {
      console.error("[axe] Accessibility scan failed:", error);
    });
}
