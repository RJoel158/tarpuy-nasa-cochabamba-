import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch((err) => {
      console.warn("ServiceWorker registration skipped or failed:", err);
    });
  });
}

// A production service worker must not serve stale bundles to Vite development.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.filter(reg => reg.active?.scriptURL === `${location.origin}/sw.js`).forEach(reg => reg.unregister());
  });
}
