// Capture the browser event before React mounts (also during the intro).
export function isIosDevice(navigator) {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function createPwaInstaller(scope) {
  const media = scope.matchMedia("(display-mode: standalone)");
  let pending = null;
  let state = { available: false, installed: media.matches || scope.navigator.standalone === true, installing: false, error: "", outcome: "" };
  const listeners = new Set();
  const update = patch => { state = { ...state, ...patch }; listeners.forEach(fn => fn()); };
  const offered = event => {
    event.preventDefault();
    if (!state.installed) { pending = event; update({ available: true, error: "", outcome: "" }); }
  };
  const installed = () => { pending = null; update({ installed: true, available: false, installing: false, error: "", outcome: "accepted" }); };
  const modeChanged = event => { if (event.matches) installed(); };
  scope.addEventListener("beforeinstallprompt", offered);
  scope.addEventListener("appinstalled", installed);
  media.addEventListener("change", modeChanged);
  return {
    getSnapshot: () => state,
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
    async install() {
      if (!pending || state.installing || state.installed) return;
      const prompt = pending;
      pending = null; // A browser prompt event can only be used once.
      update({ installing: true, available: false, error: "", outcome: "" });
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        // Acceptance is not proof of installation; wait for appinstalled.
        update({ outcome: choice.outcome });
      } catch {
        update({ error: "No se pudo abrir la instalación. Intenta desde el menú del navegador." });
      } finally { update({ installing: false }); }
    },
    destroy() {
      scope.removeEventListener("beforeinstallprompt", offered);
      scope.removeEventListener("appinstalled", installed);
      media.removeEventListener("change", modeChanged);
      listeners.clear();
    },
  };
}

export const pwaInstaller = typeof window === "undefined" ? null : createPwaInstaller(window);
